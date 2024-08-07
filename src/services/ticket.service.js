const Ticket = require('../dao/mongo/models/ticket.model');

class TicketService {
  async createTicket(ticketData) {
    return await Ticket.create(ticketData);
  }
}

module.exports = new TicketService();
