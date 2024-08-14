import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  password: { type: String, required: true },
  cart: { type: Schema.Types.ObjectId, ref: 'Cart' },
  role: { type: String, default: 'user' },
  refreshTokens: { type: [String], default: [] },
  documents: [
    {
      name: { type: String },
      reference: { type: String },
    },
  ],
  last_connection: { type: Date, default: null },
  isAdminUpgrade: { type: Boolean, default: false },
  
  // Agregamos los campos para el restablecimiento de contraseña
  resetPasswordToken: { type: String, default: null }, // Token de recuperación
  resetPasswordExpires: { type: Date, default: null }   // Fecha de expiración del token
});

export default mongoose.model('User', userSchema);
