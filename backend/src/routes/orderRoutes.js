import { Router } from 'express';
import {
  checkout,
  myOrders,
  allOrders,
  getOrder,
  verifyExit,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/checkout', checkout);
router.get('/mine', myOrders);
router.post('/verify', adminOnly, verifyExit);
router.get('/', adminOnly, allOrders);
router.get('/:id', getOrder); // keep this last so it doesn't swallow /mine

export default router;
