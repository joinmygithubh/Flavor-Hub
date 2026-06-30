import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Signs a JWT for a given user. `sub` (subject) holds the user id, which is the
 * standard JWT claim for "who this token belongs to".
 */
export const signAuthToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
