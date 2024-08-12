//const TicketService = require('../services/ticket.service');
import TicketService from '../services/ticket.service.js';

//exports.createTicket = async (req, res) => {
 export const createTicket = async (req, res) => {
try {
    const ticketData = req.body;
    const newTicket = await TicketService.createTicket(ticketData);
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket', details: error.message });
  }
};

