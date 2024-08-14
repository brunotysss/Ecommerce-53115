import transporter from '../config/transport.js';

export const sendResetPasswordEmail = async (to, link) => {
  const mailOptions = {
    from: process.env.GMAIL_ACCOUNT,
    to,
    subject: 'Password Reset',
    html: `<p>Click the link to reset your password: <a href="${link}">${link}</a></p>`
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

// Enviar correo con los detalles del ticket de compra
export const sendTicketEmail = async (to, ticket) => {
  const mailOptions = {
    from: process.env.GMAIL_ACCOUNT,  // Usas la cuenta configurada en tu .env
    to,
    subject: 'Detalles de tu compra - Ticket de compra',
    html: `
      <h1>Detalles de tu compra</h1>
      <p><strong>Código de Ticket:</strong> ${ticket.code}</p>
      <p><strong>Fecha de Compra:</strong> ${ticket.purchase_datetime}</p>
      <p><strong>Monto Total:</strong> $${ticket.amount}</p>
      <p><strong>Comprador:</strong> ${ticket.purchaser}</p>
      <p>Gracias por tu compra. Si tienes alguna pregunta, no dudes en contactarnos.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Ticket email sent to:', to);
  } catch (error) {
    console.error('Error sending ticket email:', error);
  }
};

export default transporter;
