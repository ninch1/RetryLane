import { Router } from 'express';
import {
  createDestination,
  getDestinations,
} from '../controllers/destinationController';

const router = Router();

router.post('/', createDestination);
router.get('/', getDestinations);

export default router;
