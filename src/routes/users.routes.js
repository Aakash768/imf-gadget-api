import { registerUser, loginUser, logoutUser } from '../controllers/users.controller.js';
import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Register user route
router.route('/register').post(registerUser);  

// Login user route
router.route('/login').post(loginUser);

// Logout user route
router.route("/logout").post(verifyJWT, logoutUser);

export default router;