import transporter from '../config/transport.js';

export const sendResetPasswordEmail = async (to, link) => {

  const mailOptions = {
    from: process.env.GMAIL_ACCOUNT,  // Usas la cuenta configurada en tu .env
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
