import multer from 'multer';

// Configure storage
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
});

export default upload;