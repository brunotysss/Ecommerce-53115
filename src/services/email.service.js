//const transporter = require('../config/transport');
import transporter from '../config/transport.js';

//exports.sendResetPasswordEmail = async (to, link) => {
    export const sendResetPasswordEmail = async (to, link) => {
  
const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password Reset',
    html: `<p>Click the link to reset your password: <a href="${link}">${link}</a></p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent');
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};
export default transporter;
