import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import { RESET_PASSWORD_REQUEST } from "../../features/auth/resetPassword/type";
import {
  clearResetPasswordError,
  resetResetPasswordState,
} from "../../features/auth/resetPassword/reducer";
import { toast } from "react-toastify";
import { validateResetPasswordFields } from "../../utilis/fieldValidations";
import AuthInput from "../../components/ui/AuthInput";

const ResetPassword = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, success } = useSelector(
    (state) => state.resetPassword
  );

  const email = location.state?.email || "";
  const [errors, setErrors] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  /* reset state on unmount */
  useEffect(() => {
    return () => {
      dispatch(resetResetPasswordState());
    };
  }, [dispatch]);

  /* success handling */
  useEffect(() => {
    if (success) {
      toast.success("Password reset successfully!");
      navigate("/login", { replace: true });
    }
  }, [success, navigate]);

  /* error handling */
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearResetPasswordError());
    }
  }, [error, dispatch]);


  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateResetPasswordFields({
      newPassword,
      confirmNewPassword,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    dispatch({
      type: RESET_PASSWORD_REQUEST,
      payload: {
        email,
        newPassword,
        confirmNewPassword,
      },
    });
  };

  const handleFieldChange = (field, value) => {
    if (field === "newPassword") setNewPassword(value);
    if (field === "confirmNewPassword") setConfirmNewPassword(value);

    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={isDarkMode ? "text-white" : "text-gray-900"}>
          Email not found. Please restart the reset process.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
    >
      <div
        className={`p-8 rounded-xl shadow-2xl w-full max-w-md ${isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
      >
        <div className="text-center mb-8">
          <h2
            className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"
              }`}
          >
            Reset Password
          </h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Enter your new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <AuthInput
              label="New Password"
              type="password"
              value={newPassword}
              placeholder="Enter new password"
              onChange={(v) => handleFieldChange("newPassword", v)}
              error={errors.newPassword}
              disabled={loading}
              isDarkMode={isDarkMode}
            />
          </div>

          <div>
            <AuthInput
              label="Confirm New Password"
              type="password"
              value={confirmNewPassword}
              placeholder="Confirm password"
              onChange={(v) => handleFieldChange("confirmNewPassword", v)}
              error={errors.confirmNewPassword}
              disabled={loading}
              isDarkMode={isDarkMode}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/forgot-password"
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Back to Forgot Password
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
