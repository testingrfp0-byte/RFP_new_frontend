export const validateLoginPayload = ({username, email, password }) => {
  if (!email || !password) {
    return "All fields are required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
};

export const validateRegisterPayload = ({ username, email, password }) => {
  if (!username || !email || !password) {
    return "All fields are required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
};

export const validateOtpPayload = ({ email, otp }) => {
  if (!email || !otp) {
    return "Email and One Time Password are required.";
  }

  if (otp.length < 4) {
    return "Please enter a valid One Time Password.";
  }

  return null;
};

export const validateForgotPasswordPayload = ({ email }) => {
  if (!email) return "Email is required.";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }

  return null;
};

export const validateResetPasswordPayload = ({
  email,
  newPassword,
  confirmNewPassword,
}) => {
  if (!email) {
    return "Email not provided. Please restart the reset process.";
  }

  if (!newPassword || !confirmNewPassword) {
    return "All fields are required.";
  }

  if (newPassword.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (newPassword !== confirmNewPassword) {
    return "Passwords do not match.";
  }

  return null;
};

export const validateChangePasswordPayload = ({
  oldPassword,
  newPassword,
  confirmPassword,
}) => {
  if (!oldPassword || !newPassword || !confirmPassword) {
    return "All fields are required.";
  }

  if (newPassword !== confirmPassword) {
    return "Passwords do not match.";
  }

  if (oldPassword === newPassword) {
    return "New password cannot be the same as old password.";
  }

  if (newPassword.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
};

export const validateAdminRegisterPayload = ({
  username,
  email,
  password,
}) => {
  if (!username || !email || !password) {
    return "All fields are required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
};

export const validateRegisterVerifiedPayload = ({
  username,
  email,
  oldPassword,
  newPassword,
}) => {
  if (!username || !email || !oldPassword || !newPassword) {
    return "All fields are required.";
  }

  if (newPassword.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
};
