import jwt from 'jsonwebtoken';

const secret = () => process.env.JWT_SECRET || 'dev_secret_change_me';

export const signToken = (id) => jwt.sign({ id }, secret(), { expiresIn: '7d' });

export const verifyToken = (token) => jwt.verify(token, secret());
