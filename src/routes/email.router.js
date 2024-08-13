import { Router } from 'express';
import { sendMail } from '../config/transport.js'; // Asegúrate de que la ruta sea correcta

const router = Router();

router.post('/send', async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    await sendMail(to, subject, text);
    res.status(200).json({ message: 'Correo enviado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error enviando correo', error: error.message });
  }
});

export default router;
