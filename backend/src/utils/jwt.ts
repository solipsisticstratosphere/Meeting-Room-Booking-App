import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn: StringValue | number = (process.env.JWT_EXPIRES_IN || '7d') as StringValue;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const options: SignOptions = { expiresIn };
  return jwt.sign({ userId }, secret, options);
};

export const verifyToken = (token: string): { userId: string } => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.verify(token, secret) as { userId: string };
};
