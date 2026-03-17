const net = require('net');
const { spawn } = require('child_process');

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '0.0.0.0');
  });
}

async function findAvailablePort(startPort) {
  let port = startPort;
  while (!(await isPortFree(port))) {
    port += 1;
  }
  return port;
}

async function main() {
  const basePort = Number(process.env.PORT) || 3000;
  const selectedPort = await findAvailablePort(basePort);

  const reactStartScript = require.resolve('react-scripts/scripts/start');
  const env = { ...process.env, PORT: String(selectedPort) };

  console.log('[dev] Starting frontend on port', selectedPort);

  const child = spawn(process.execPath, [reactStartScript], {
    stdio: 'inherit',
    env,
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });

  child.on('error', (err) => {
    console.error('[dev] Failed to start frontend:', err.message);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error('[dev] Unexpected start failure:', err.message);
  process.exit(1);
});
