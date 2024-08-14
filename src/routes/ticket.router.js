/*const { Router } = require('express');
const TicketController = require('../controllers/ticket.controller');
*/
import { Router } from 'express';
import TicketController from '../controllers/ticket.controller.js';
import { authenticate, authorize } from '../middleware/auth.js'; // Asegúrate de usar el middleware de autenticación

const router = Router();

router.post('/', TicketController.createTicket);

// Ruta para ver el ticket después de la compra
//router.get('/ticket/:tid', authenticate, TicketController.getTicketById);


export default router;

//module.exports = router;
