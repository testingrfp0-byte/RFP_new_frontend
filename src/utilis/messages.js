export const mapSuccessMessage = (res, context) => {
  if (res?.data?.message) return res.data.message;

  if (context === "LOGIN") return "Login successful";

  return "Operation successful";
};

export const mapErrorMessage = (error, context) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (data?.detail) return data.detail;
  if (data?.message) return data.message;

  switch (status) {
    case 400:
      return "Invalid request.";
    case 401:
      return "Email or password is incorrect.";
    case 500:
      return "Server error. Please try again.";
    default:
      return context === "LOGIN"
        ? "Unable to login. Please try again."
        : "Something went wrong.";
  }
};
