//const Ticket = require('../../models/ticket.model');

import Ticket from '../../models/ticket.model.js';
class TicketDAO {
  async createTicket(ticketData) {
    return await Ticket.create(ticketData);
  }
}

export default new TicketDAO();

//module.exports = new TicketDAO();
