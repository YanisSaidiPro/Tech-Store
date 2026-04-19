const isValidEmail = (email) => {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseId = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
};

const parseDate = (value) => {
  if (value == null || value === '') {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
};

const isValidRole = (role) => {
  return ['client', 'vendeur', 'admin'].includes(role);
};

module.exports = {
  isValidEmail,
  parseNumber,
  parseId,
  parseDate,
  isValidRole
};
