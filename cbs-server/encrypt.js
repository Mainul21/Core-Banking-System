const bcrypt = require('bcryptjs');

const hashPassword = async () => {
  const password = '1234';
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed Password:', hashedPassword);
};

hashPassword();
