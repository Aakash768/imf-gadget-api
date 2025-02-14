import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkRole } from '../controllers/role.middleware.js';
import  { getGadgets, postGadgets, updateGadgets, deleteGadgets, selfDestruct } from '../controllers/gadget.controller.js';

const router = Router();

// Get gadgets route
router.route('/').get(verifyJWT, checkRole(['user', 'admin']),getGadgets);

// Post gadgets route
router.route('/').post(verifyJWT, checkRole(['admin']), postGadgets);

// Update gadgets route
router.route('/:id').put(verifyJWT, checkRole(['admin']), updateGadgets);

// Delete gadgets route
router.route('/:id').delete(verifyJWT, checkRole(['admin']), deleteGadgets);

// Self-destruct route
router.route('/self-destruct').delete(verifyJWT, checkRole(['admin']), selfDestruct);   


export default router;