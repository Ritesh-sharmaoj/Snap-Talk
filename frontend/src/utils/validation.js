export const isEmail = (value) => /\S+@\S+\.\S+/.test(value);

export const validateAuth = ({ username, fullName, identifier, password, mode }) => {
  const errors = {};

  if (mode === 'signup') {
    if (!username || username.length < 3) errors.username = 'Choose a username with 3+ characters.';
    if (!fullName || fullName.length < 2) errors.fullName = 'Full name is required.';
  }

  if (!identifier) errors.identifier = 'Email, mobile, or username is required.';
  if (!password) {
    errors.password = 'Password is required.';
  } else if (mode === 'signup') {
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Use upper, lower, and a number in the password.';
    }
  }

  return errors;
};
