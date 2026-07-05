import { Router } from 'express';
import authRoutes from './authRoutes.js';
import contractorRoutes from './contractorRoutes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true, service: 'mister-api' }));

router.use('/auth', authRoutes);
router.use('/contractors', contractorRoutes);

// Mounted in later phases:
// router.use('/customers', customerRoutes);
// router.use('/offers', offerRoutes);
// router.use('/jobs', jobRoutes);
// router.use('/messages', messageRoutes);
// router.use('/payments', paymentRoutes);
// router.use('/reviews', reviewRoutes);
// router.use('/disputes', disputeRoutes);
// router.use('/admin', adminRoutes);
// router.use('/trades', tradeRoutes);
// router.use('/notifications', notificationRoutes);

export default router;
