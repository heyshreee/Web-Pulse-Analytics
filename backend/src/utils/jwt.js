import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';

/**
 * Token model
 * -----------
 * Every token carries two claims that the API relies on:
 *
 *   purpose  — what the token is allowed to do. `session` tokens authenticate
 *              API/WebSocket requests. `password_reset` tokens may only be
 *              presented to the password-reset endpoint. Without this claim a
 *              session token would double as a password-reset token.
 *   jti      — a unique id for the issued token. The session store keys rows
 *              on it, which is what makes server-side revocation possible.
 *
 * Tokens minted before the `purpose` claim existed are no longer accepted:
 * they cannot be told apart from legacy password-reset links, and accepting
 * them would keep those links usable.
 */
export const TOKEN_PURPOSE = {
    SESSION: 'session',
    PASSWORD_RESET: 'password_reset'
};

export const SESSION_TTL = '7d';
export const RESET_TTL = '15m';

const sign = (payload, options) =>
    jwt.sign(payload, env.jwtSecret, { jwtid: crypto.randomUUID(), ...options });

/** Session token used by the console and the authenticated API. */
export const generateToken = (userId, { expiresIn = SESSION_TTL, tokenId } = {}) =>
    sign(
        { id: userId, purpose: TOKEN_PURPOSE.SESSION },
        { expiresIn, ...(tokenId ? { jwtid: tokenId } : {}) }
    );

/** Short-lived, single-use token that only the password-reset flow accepts. */
export const generateResetToken = (userId, { tokenId } = {}) =>
    sign(
        { id: userId, purpose: TOKEN_PURPOSE.PASSWORD_RESET },
        { expiresIn: RESET_TTL, ...(tokenId ? { jwtid: tokenId } : {}) }
    );

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

/** Reads the claims of a token without verifying its signature. */
export const decodeToken = (token) => jwt.decode(token);

export default {
    TOKEN_PURPOSE,
    SESSION_TTL,
    RESET_TTL,
    generateToken,
    generateResetToken,
    verifyToken,
    decodeToken
};
