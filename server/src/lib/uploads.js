import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const uploadPath = path.resolve(process.cwd(), uploadDir);

// Ensure upload directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Storage configuration for multer
const storage = multer.diskStorage({
  destination(request, file, callback) {
    callback(null, uploadPath);
  },
  filename(request, file, callback) {
    const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${uniquePrefix}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

export const upload = multer({ storage });

// Helper function to delete file from disk
export function deleteFile(filePath) {
  if (!filePath) return;
  const fullPath = path.resolve(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (error) {
      console.error(`Error deleting file ${fullPath}:`, error);
    }
  }
}

// Helper function to delete multiple files
export function deleteFiles(filePaths) {
  if (!Array.isArray(filePaths)) return;
  filePaths.forEach(filePath => deleteFile(filePath));
}

// Helper function to get file url from request
export function getFileUrl(file) {
  return file ? `/uploads/${file.filename}` : null;
}

// Helper function to get multiple file urls from request
export function getFileUrls(files) {
  if (!Array.isArray(files)) return [];
  return files.map(file => `/uploads/${file.filename}`);
}
