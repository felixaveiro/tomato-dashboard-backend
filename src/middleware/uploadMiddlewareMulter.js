import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../media'); 
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory at:', uploadDir);
} else {
  console.log('Uploads directory exists at:', uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    console.log('Saving file as:', uniqueFilename);
    cb(null, uniqueFilename);
  }
});
const upload = multer({ storage });
export const uploadMiddleware = upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'image', maxCount: 4 },
  { name: 'images', maxCount: 20 }
]);
