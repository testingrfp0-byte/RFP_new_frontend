import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import { REGISTER_REQUEST } from "../../features/auth/register/type";
import {
  clearRegisterError,
  resetRegisterState,
} from "../../features/auth/register/reducer";
import { toast } from "react-toastify";
import { validateRegisterFields } from "../../utilis/fieldValidations";
import AuthInput from "../../components/ui/AuthInput";

export default function Register() {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const { loading, error, success } =
    useSelector((state) => state.register) || {};

  useEffect(() => {
    dispatch(resetRegisterState());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Registration successful! Please verify your email.", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate("/verify-email-otp", {
          state: {
            otpData: {
              title: "register",
              email,
            },
          },
        });
      }, 500);
    }
  }, [success, navigate, email]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 3000,
      });
      dispatch(clearRegisterError());
    }
  }, [error, dispatch]);


  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateRegisterFields({
      username,
      email,
      password,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    dispatch({
      type: REGISTER_REQUEST,
      payload: {
        username,
        email,
        password,
      },
    });
  };

  const handleFieldChange = (field, value) => {
    if (field === "username") setUsername(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
    >
      <div
        className={`p-8 rounded-xl shadow-2xl w-full max-w-md transition-colors ${isDarkMode
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-200"
          }`}
      >
        <div className="text-center mb-8">
          <h2
            className={`text-3xl font-bold mb-2 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
              }`}
          >
            Create Account
          </h2>
          <p
            className={`transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
          >
            Join us to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <AuthInput
              label="Username"
              value={username}
              placeholder="Enter username"
              onChange={(v) => handleFieldChange("username", v)}
              error={errors.username}
              disabled={loading}
              isDarkMode={isDarkMode}
            />
          </div>

          <div>
            <AuthInput
              label="Email"
              value={email}
              placeholder="Enter email"
              onChange={(v) => handleFieldChange("email", v)}
              error={errors.email}
              disabled={loading}
              isDarkMode={isDarkMode}
            />
          </div>

          <div>
            <AuthInput
              label="Password"
              type="password"
              value={password}
              placeholder="Create password"
              onChange={(v) => handleFieldChange("password", v)}
              error={errors.password}
              disabled={loading}
              isDarkMode={isDarkMode}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span
            className={`transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
          >
            Already have an account?{" "}
          </span>
          <Link
            to="/login"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
