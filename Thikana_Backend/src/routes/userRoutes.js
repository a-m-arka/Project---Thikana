import express from 'express';
import upload from '../config/multer.js';
import * as userController from '../controllers/userController.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/get-user-data', authenticateToken, userController.getUser);
router.put('/update-profile-picture', authenticateToken, upload.single('file'), userController.updateProfilePicture);
router.put('/edit-profile', authenticateToken, userController.editProfile);
router.put('/change-password', authenticateToken, userController.changePassword);


export default router;