import { Router } from 'express';
import {
  createDestination,
  deleteDestination,
  getDestinations,
} from '../controllers/destinationController';

const router = Router();

router.post('/', createDestination);
router.get('/', getDestinations);
router.delete('/:id', deleteDestination);

export default router;
