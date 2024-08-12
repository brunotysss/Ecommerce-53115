//const Ticket = require('../dao/mongo/models/ticket.model');
import Ticket from '../dao/mongo/models/ticket.model.js';

class TicketService {
  async createTicket(ticketData) {
    return await Ticket.create(ticketData);
  }
}

export default new TicketService();


//module.exports = new TicketService();
