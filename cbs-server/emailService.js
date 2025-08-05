const dotenv = require('dotenv').config();

const nodemailer = require('nodemailer');


// console.log(process.env.EMAIL_PASS, process.env.EMAIL_USER); 


const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS,  
  },
});

const sendLoanNotification = async (customerEmail, loanStatus) => {
  const subject = loanStatus === 'approved' ? 'Your Loan Has Been Approved' : 'Your Loan Has Been Rejected';
  const text = loanStatus === 'approved'
    ? 'Congratulations! Your loan has been approved.'
    : 'Unfortunately, your loan application has been rejected.';

  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: customerEmail, 
    subject: subject, 
    text: text, 
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email notification');
  }
};

module.exports = { sendLoanNotification };
