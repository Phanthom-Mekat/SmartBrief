const multer = require('multer');
const path = require('path');
const os = require('os');

// Configure storage - use /tmp in serverless, uploads/ locally
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use /tmp for serverless (Vercel, Lambda), uploads/ for local
    const uploadDir = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME 
      ? os.tmpdir() 
      : 'uploads/';
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only accept .txt and .docx
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.txt', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .txt and .docx files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter
});

module.exports = upload;
