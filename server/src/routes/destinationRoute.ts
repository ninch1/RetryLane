import { Router } from 'express';
import {
  createDestination,
  deleteDestination,
  getDestinations,
} from '../controllers/destinationController';
import { getEvents, submitEvent } from '../controllers/eventController';

const router = Router();

router.post('/', createDestination);
router.get('/', getDestinations);
router.post('/:destinationId/events', submitEvent);
router.get('/:destinationId/events', getEvents);
router.delete('/:id', deleteDestination);

export default router;
