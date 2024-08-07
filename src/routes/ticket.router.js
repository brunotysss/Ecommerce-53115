const { Router } = require('express');
const TicketController = require('../controllers/ticket.controller');

const router = Router();

router.post('/', TicketController.createTicket);

module.exports = router;
