const Ticket = require('../../models/ticket.model');

class TicketDAO {
  async createTicket(ticketData) {
    return await Ticket.create(ticketData);
  }
}

module.exports = new TicketDAO();
