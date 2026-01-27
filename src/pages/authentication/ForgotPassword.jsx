import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import { FORGOT_PASSWORD_REQUEST } from "../../features/auth/forgotPassword/type";
import {
  clearForgotPasswordError,
  resetForgotPasswordState,
} from "../../features/auth/forgotPassword/reducer";
import { toast } from "react-toastify";
import { validateForgotPasswordFields } from "../../utilis/fieldValidations";
import AuthInput from "../../components/ui/AuthInput";

const ForgotPassword = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector(
    (state) => state.forgotPassword
  );

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  /* reset state on unmount */
  useEffect(() => {
    return () => {
      dispatch(resetForgotPasswordState());
    };
  }, [dispatch]);

  /* success handling */
  useEffect(() => {
    if (success) {
      toast.success("OTP has been sent to your email.");

      navigate("/verify-email-otp", {
        state: {
          otpData: {
            title: "forgot",
            email,
          },
        },
      });
    }
  }, [success, navigate, email]);

  /* error handling */
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearForgotPasswordError());
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForgotPasswordFields({ email });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    dispatch({
      type: FORGOT_PASSWORD_REQUEST,
      payload: { email },
    });
  };

  const handleFieldChange = (value) => {
    setEmail(value);

    if (errors.email) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.email;
        return updated;
      });
    }
  };

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
            Forgot Password
          </h2>
          <p
            className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Enter your email to receive an OTP
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <AuthInput
              label="Email Address"
              value={email}
              placeholder="Enter your email"
              onChange={(v) => handleFieldChange(v)}
              error={errors.email}
              disabled={loading}
              isDarkMode={isDarkMode}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
