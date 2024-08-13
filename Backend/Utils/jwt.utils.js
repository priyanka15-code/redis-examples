


const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    username: encrypt(user.username), 
    email: encrypt(user.email)
  }  
  const secretKey = process.env.SECRET_KEY;
  console.log("Token:",secretKey);
  if (!secretKey) {
    throw new Error('No secret key found.');
  }

  return jwt.sign(payload, secretKey, { 
    expiresIn: '1h',
    algorithm: 'HS256' 
  });
};

function encrypt(data) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.randomBytes(32); 
  const iv = crypto.randomBytes(16); 
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

module.exports = { generateToken };
