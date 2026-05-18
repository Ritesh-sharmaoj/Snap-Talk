export const isEmail = (value) => /\S+@\S+\.\S+/.test(value);

export const validateAuth = ({ username, fullName, identifier, password, mode }) => {
  const errors = {};

  if (mode === 'signup') {
    if (!username || username.length < 3) errors.username = 'Choose a username with 3+ characters.';
    if (!fullName || fullName.length < 2) errors.fullName = 'Full name is required.';
  }

  if (!identifier) errors.identifier = 'Email, mobile, or username is required.';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters.';

  return errors;
};
