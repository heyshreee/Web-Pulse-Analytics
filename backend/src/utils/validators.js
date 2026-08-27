const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => EMAIL_RE.test(email);

export const validatePassword = (password) => password.length >= 6;

export default { validateEmail, validatePassword };
