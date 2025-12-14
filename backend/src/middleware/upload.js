import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
            cb(new Error("Only Excel files allowed"));
        }
        cb(null, true);
    },
});
