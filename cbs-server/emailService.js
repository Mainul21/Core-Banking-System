const dotenv = require('dotenv').config();
 // Load environment variables from .env file
const nodemailer = require('nodemailer');


console.log(process.env.EMAIL_PASS, process.env.EMAIL_USER); // Debugging line to check if environment variables are loaded correctly

// Log email service initialization for debugging purposes
// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail as an email provider
  auth: {
    user: process.env.EMAIL_USER,  // Your email address
    pass: process.env.EMAIL_PASS,  // Your email password or app-specific password
  },
});

const sendLoanNotification = async (customerEmail, loanStatus) => {
  const subject = loanStatus === 'approved' ? 'Your Loan Has Been Approved' : 'Your Loan Has Been Rejected';
  const text = loanStatus === 'approved'
    ? 'Congratulations! Your loan has been approved.'
    : 'Unfortunately, your loan application has been rejected.';

  const mailOptions = {
    from: process.env.EMAIL_USER, // sender address
    to: customerEmail, // receiver address
    subject: subject, // subject line
    text: text, // plain text body
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email notification');
  }
};

module.exports = { sendLoanNotification };
