import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const DB_IMAGE_DIR = path.join(process.cwd(), 'public', 'product_image');

// Auth middleware for Vercel
const authenticateAdmin = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    return decoded.role === 'admin';
  } catch (error) {
    return false;
  }
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Check Cloudinary env vars
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'Cloudinary environment variables are not set' });
    }

    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Form parse error', details: err.message });
      }
      console.log('Formidable files:', files);
      let file = files.image;
      if (Array.isArray(file)) file = file[0];
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      try {
        // Only allow Cloudinary upload on Vercel
        const result = await cloudinary.uploader.upload(file.filepath, {
          folder: 'products',
          resource_type: 'image',
        });
        return res.status(200).json({ url: result.secure_url, source: 'cloudinary' });
      } catch (cloudErr) {
        return res.status(500).json({ error: 'Cloudinary upload failed', details: cloudErr.message });
      }
    });
  } catch (e) {
    console.error('Image upload error:', e);
    return res.status(500).json({ error: 'Server error', details: e.message });
  }
}
