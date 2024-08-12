/*const { Router } = require('express');
const TicketController = require('../controllers/ticket.controller');
*/
import { Router } from 'express';
import { createTicket } from '../controllers/ticket.controller.js';

const router = Router();

router.post('/', createTicket);


export default router;

//module.exports = router;
