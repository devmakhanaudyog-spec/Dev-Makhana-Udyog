/**
 * bootstrap-db.js
 * Idempotent database bootstrap / migration script.
 *
 * What it does:
 *   1. Connects to MongoDB using MONGODB_URI from environment.
 *   2. Registers all 10 Mongoose models (loads schemas + their index definitions).
 *   3. Calls syncIndexes() on every model → creates any missing indexes safely.
 *   4. Creates the Settings singleton document (if absent).
 *   5. Optionally seeds an admin User from ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 *   6. Reports every missing collection it touched and every index it ensured.
 *
 * Safe to re-run on a fresh or partial database at any time.
 * Never drops or modifies existing data.
 *
 * Usage:
 *   cd server
 *   node bootstrap-db.js
 *   # or via npm: npm run bootstrap
 */

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// ── Environment guard ────────────────────────────────────────────────────────
const MONGODB_URI = (process.env.MONGODB_URI || '').trim();
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI is not set. Add it to server/.env and retry.');
  process.exit(1);
}

// ── Load every model so Mongoose registers the schema + index definitions ────
const User        = require('./models/User');
const Product     = require('./models/Product');
const Order       = require('./models/Order');
const Review      = require('./models/Review');
const Coupon      = require('./models/Coupon');
const Newsletter  = require('./models/Newsletter');
const Contact     = require('./models/Contact');
const Settings    = require('./models/Settings');
const BulkOrder   = require('./models/BulkOrder');
const FreeSample  = require('./models/FreeSample');

// ── Expected collection names (model → plural lower-case Mongoose default) ───
const EXPECTED_COLLECTIONS = [
  { model: User,       name: 'users'      },
  { model: Product,    name: 'products'   },
  { model: Order,      name: 'orders'     },
  { model: Review,     name: 'reviews'    },
  { model: Coupon,     name: 'coupons'    },
  { model: Newsletter, name: 'newsletters'},
  { model: Contact,    name: 'contacts'   },
  { model: Settings,   name: 'settings'   },
  { model: BulkOrder,  name: 'bulkorders' },
  { model: FreeSample, name: 'freesamples'},
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const ok    = (msg) => console.log(`  ✅  ${msg}`);
const warn  = (msg) => console.log(`  ⚠️   ${msg}`);
const info  = (msg) => console.log(`  ℹ️   ${msg}`);
const sep   = ()    => console.log('  ' + '─'.repeat(60));

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀  Dev Makhana Udyog — Database Bootstrap\n');

  // 1. Connect
  console.log('🔌  Connecting to MongoDB Atlas…');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  ok(`Connected  (db: ${mongoose.connection.db.databaseName})`);
  sep();

  // 2. Snapshot existing collections in the DB
  const existingRaw = await mongoose.connection.db.listCollections().toArray();
  const existingNames = new Set(existingRaw.map((c) => c.name));

  console.log('📋  Existing collections in DB:');
  if (existingNames.size === 0) {
    info('(none — fresh database)');
  } else {
    [...existingNames].forEach((n) => info(n));
  }
  sep();

  // 3. Per-model: ensure collection exists + sync indexes
  console.log('🔧  Syncing collections & indexes…\n');

  const report = {
    alreadyExisted : [],
    created        : [],
    indexesSynced  : [],
    errors         : [],
  };

  for (const { model, name } of EXPECTED_COLLECTIONS) {
    const existed = existingNames.has(name);
    process.stdout.write(`  [${name}]  `);

    try {
      // syncIndexes creates the collection (if absent) and builds all model indexes
      await model.syncIndexes();

      if (existed) {
        console.log('already existed — indexes synced ✓');
        report.alreadyExisted.push(name);
      } else {
        console.log('CREATED (was missing) — indexes built ✓');
        report.created.push(name);
      }
      report.indexesSynced.push(name);
    } catch (err) {
      // MongoDB error 85 = IndexOptionsConflict: the *existing* index in the DB
      // already satisfies the schema (e.g. has unique/sparse flags). Safe to ignore.
      if (err.code === 85 || (err.message && err.message.includes('same name as the requested index'))) {
        console.log('already existed — existing indexes OK (options already correct) ✓');
        report.alreadyExisted.push(name);
        report.indexesSynced.push(name);
      } else {
        console.log(`ERROR — ${err.message}`);
        report.errors.push({ collection: name, error: err.message });
      }
    }
  }

  sep();

  // 4. Seed Settings singleton
  console.log('⚙️   Seeding default Settings document…');
  try {
    const existingSettings = await Settings.findOne();
    if (!existingSettings) {
      await Settings.create({});
      ok('Settings singleton created with all defaults.');
      report.created.push('settings (document)');
    } else {
      ok('Settings document already present — skipped.');
    }
  } catch (err) {
    warn(`Could not seed Settings: ${err.message}`);
    report.errors.push({ collection: 'settings (document)', error: err.message });
  }

  sep();

  // 5. Optionally seed admin user
  console.log('👤  Checking admin user…');
  const adminEmail    = (process.env.ADMIN_EMAIL    || '').trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();

  if (!adminEmail || !adminPassword ||
      adminEmail    === 'admin@example.com' ||
      adminPassword === 'replace_with_strong_admin_password') {
    warn('ADMIN_EMAIL / ADMIN_PASSWORD not configured or still placeholder — skipping admin seed.');
    warn('Set real values in server/.env to auto-create the admin account.');
  } else {
    try {
      const existingAdmin = await User.findOne({ email: adminEmail });
      if (!existingAdmin) {
        await User.create({
          name:          'Administrator',
          email:         adminEmail,
          password:      adminPassword,
          phone:         '+91 0000000000',
          role:          'admin',
          emailVerified: true,
          authMethod:    'email',
        });
        ok(`Admin user created for ${adminEmail}.`);
        report.created.push(`admin user (${adminEmail})`);
      } else if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        ok(`Existing user ${adminEmail} promoted to admin.`);
      } else {
        ok(`Admin user ${adminEmail} already exists — skipped.`);
      }
    } catch (err) {
      warn(`Could not seed admin user: ${err.message}`);
      report.errors.push({ collection: 'users (admin)', error: err.message });
    }
  }

  sep();

  // 6. Print final report
  console.log('📊  BOOTSTRAP REPORT\n');

  console.log('  Expected collections (10):');
  EXPECTED_COLLECTIONS.forEach(({ name }) => {
    const wasCreated = report.created.includes(name);
    console.log(`    ${wasCreated ? '🆕' : '✅'} ${name}${wasCreated ? '  ← created' : ''}`);
  });

  if (report.created.length) {
    console.log(`\n  🆕  Newly created (${report.created.length}):`);
    report.created.forEach((n) => console.log(`       • ${n}`));
  }

  if (report.errors.length) {
    console.log(`\n  ❌  Errors (${report.errors.length}):`);
    report.errors.forEach(({ collection, error }) =>
      console.log(`       • ${collection}: ${error}`)
    );
  } else {
    console.log('\n  No errors encountered.');
  }

  console.log('\n  To re-run this setup at any time:');
  console.log('    cd server && npm run bootstrap\n');

  sep();
  console.log('✅  Bootstrap complete.\n');
}

main()
  .catch((err) => {
    console.error('\n❌  Bootstrap FAILED:', err.message);
    process.exit(1);
  })
  .finally(() => mongoose.connection.close());
