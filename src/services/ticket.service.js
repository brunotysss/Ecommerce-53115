//const Ticket = require('../dao/mongo/models/ticket.model');
import Ticket from '../dao/mongo/models/ticket.model.js';
import TicketDAO from '../dao/mongo/ticket.dao.js';

class TicketService {
  async createTicket(ticketData) {
    return await Ticket.create(ticketData);
  }

  async getTicketById(ticketId) {
    try {

      const ticket = await TicketDAO.getTicketById(ticketId);
      if (!ticket) {
        return null;
      }


      return ticket;
    } catch (error) {
      console.error('Error en el servicio al obtener el ticket:', error.message);

      throw new Error('Error al obtener el ticket');
    }
  }

}

export default new TicketService();


//module.exports = new TicketService();
