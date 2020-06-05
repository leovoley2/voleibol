require('multer');

const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single('imagen');

export { multerUploads };