import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const generateToken = (userId) =>
  jwt.sign({ id: userId }, env.jwtSecret, { expiresIn: '7d' });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export default { generateToken, verifyToken };
