import express from 'express';
import multer from 'multer';
import { importUsers, exportUsers, getSampleUsers, getUsers } from '../controllers/userController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/import', upload.single('file'), importUsers);
router.get('/export', exportUsers);
router.get('/sample', getSampleUsers);
router.get('/', getUsers);

export default router;
