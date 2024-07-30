/* const jwt = require('jsonwebtoken');

const generateToken = (user, exWord) => {
  const payload = {
    header: {
      alg: 'HS256',
      typ: 'JWT'    
    },
    data: {
      userId: user._id,
      username: user.username,
      email: user.email
    }
  };
  
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('No secret key found. ');
  }

  const combinedKey = secretKey + exWord;
  
  return jwt.sign(payload.data, combinedKey, { 
    expiresIn: '1h',
    header: payload.header
  });
};

module.exports = { generateToken };
 */

// jwtUtils.js

/* const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    userId: user._id.toString(), 
    username: user.username,
    email: user.email
  };
  
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error('No secret key found.');
  }

  return jwt.sign(payload, secretKey, { 
    expiresIn: '1h',
    algorithm: 'HS256' 
  });
};

module.exports = { generateToken };
 */


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
