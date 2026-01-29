import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import { useUser } from "../../contexts/UserContext";
import { LOGIN_REQUEST } from "../../features/auth/login/type";
import {
  clearLoginError,
  resetLoginState,
} from "../../features/auth/login/reducer";
import { validateLoginFields } from "../../utilis/fieldValidations";
import AuthInput from "../../components/ui/AuthInput";

export default function Login() {
  const { isDarkMode } = useTheme();
  const { updateProfileImage } = useUser();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});

  const { loading, error, success, user } =
    useSelector((state) => state.login) || {};

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const isAdminFlow =
    location.state?.fromAdminRegister ||
    location.search.includes("admin=true") ||
    document.referrer.includes("/admin-register");

  useEffect(() => {
    dispatch(resetLoginState());
  }, [dispatch]);

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      navigate("/", { replace: true });
      return;
    }

    const savedCredentials = localStorage.getItem("savedCredentials");
    if (savedCredentials) {
      const parsed = JSON.parse(savedCredentials);
      setEmail(parsed.email || "");
      setPassword(parsed.password || "");
      setRememberMe(parsed.rememberMe || false);
    }
  }, [navigate]);

  useEffect(() => {
    if (success && user) {
      if (user.image_url) {
        updateProfileImage(user.image_url);
      }

      // Toast handled in saga now
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);
    }
  }, [success, user, updateProfileImage, navigate]);

  useEffect(() => {
    if (error) {
      // Toast handled in saga now
      dispatch(clearLoginError());
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateLoginFields({
      email,
      password,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    dispatch({
      type: LOGIN_REQUEST,
      payload: {
        email,
        password,
        rememberMe,
      },
    });
  };

  const handleFieldChange = (field, value) => {
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
            Welcome Back
          </h2>
          <p
            className={`transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
          >
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <AuthInput
              label="Email Address"
              value={email}
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              onChange={(v) => handleFieldChange("password", v)}
              error={errors.password}
              disabled={loading}
              isDarkMode={isDarkMode}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              className={`h-4 w-4 text-purple-600 focus:ring-purple-500 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode
                ? "border-gray-600 bg-gray-700"
                : "border-gray-300 bg-white"
                }`}
            />
            <label
              htmlFor="rememberMe"
              className={`ml-2 block text-sm transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
            >
              Remember me for 30 days
            </label>
          </div>

          <div className="text-right text-sm">
            <Link
              to="/forgot-password"
              className={`font-medium transition-colors ${isDarkMode
                ? "text-purple-400 hover:text-purple-300"
                : "text-purple-600 hover:text-purple-500"
                }`}
            >
              Forgot password?
            </Link>
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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span
            className={`transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
          >
            Don't have an account?{" "}
          </span>
          <Link
            to={isAdminFlow ? "/admin-register" : "/register"}
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
