import express from 'express';
import { submitContact } from '../controllers/contactController.js';
import { testEmail } from '../controllers/testController.js';

const router = express.Router();

router.post('/submit', submitContact);
router.get('/test', testEmail);

export default router;
