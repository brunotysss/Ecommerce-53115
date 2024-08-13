//const nodemailer = require('nodemailer');
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ACCOUNT,
    pass: process.env.GMAIL_PASSWORD
  }
});


export const sendMail = async (to, subject, text) => {
  const mailOptions = {
    from: 'tu_correo@gmail.com',
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado exitosamente');
  } catch (error) {
    console.error('Error enviando correo:', error);
  }
};

export default transporter;
