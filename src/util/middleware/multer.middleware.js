import multer from "multer";
import path from "path";
// Store files in temporary location ie. in volatile memory.
const storage = multer.memoryStorage();
export const uploadToMemory = multer({ storage });
//Upload in local server
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')  
    },
    filename: function (req, file, cb) {
        console.log(file)
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
export const uploadToDisk = multer({ storage: diskStorage });       