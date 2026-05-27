import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getDocuments, uploadDocument, deleteDocument } from '../controllers/documents.controller.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

const router = Router();

router.get('/', getDocuments);
router.post('/', upload.single('file'), uploadDocument);
router.delete('/:id', deleteDocument);

export default router;