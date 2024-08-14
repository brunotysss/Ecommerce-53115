//const mongoose = require('mongoose');
import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  purchase_datetime: { type: Date, required: true },
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }  // Agregando referencia al usuario

});

export default mongoose.model('Ticket', ticketSchema);

//module.exports = mongoose.model('Ticket', ticketSchema);
