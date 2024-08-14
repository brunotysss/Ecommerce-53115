//const TicketService = require('../services/ticket.service');
import TicketService from '../services/ticket.service.js';
import { sendTicketEmail } from '../services/email.service.js';

//exports.createTicket = async (req, res) => {
 const createTicket = async (req, res) => {
try {
    const ticketData = req.body;
    const newTicket = await TicketService.createTicket(ticketData);
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ticket', details: error.message });
  }
};
//const deleteAllProductsFromCart = async (req, res) => {

 const getTicketById = async (req, res) => {
  try {
      const ticketId = req.params.tid;
      const userEmail = req.user.email;

      const ticket = await TicketService.getTicketById(ticketId);
      console.log(`Buscando ticket con ID: ${ticketId}`);

      if (!ticket) {
        console.log(`Ticket no encontrado con ID: ${ticketId}`);

          return res.status(404).json({ error: 'Ticket not found' });
      }
       // Convertir a un objeto plano (si es necesario)
    const plainTicket = {
      code: ticket.code,
      purchase_datetime: ticket.purchase_datetime,
      amount: ticket.amount,
      purchaser: ticket.purchaser,
      id: ticket._id.toString() // Convertir ObjectId a string
    };

// Enviar el correo con los detalles del ticket
await sendTicketEmail(userEmail, plainTicket);

console.log('Correo enviado al comprador:', userEmail);
    res.render('ticket', { ticket: plainTicket });
  } catch (error) {
    console.error('Error al obtener el ticket en el controlador:', error.message);

      res.status(500).json({ error: 'Failed to fetch ticket', details: error.message });
  }
};


export default {
  getTicketById,
  createTicket
};
