import { diskStorage } from 'multer';

export const multerConfig = {
    storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
            const uniqueName = Date.now() + '-' + file.originalname;
            cb(null, uniqueName);
        },
    }),
};