import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import { ADMIN_REGISTER_REQUEST } from "../../features/auth/adminRegister/type";
import {
  clearAdminRegisterError,
  resetAdminRegisterState,
} from "../../features/auth/adminRegister/reducer";
import { toast } from "react-toastify";
import { validateAdminRegisterFields } from "../../utilis/fieldValidations";
import AuthInput from "../../components/ui/AuthInput";

export default function AdminRegister() {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useSelector(
    (state) => state.adminRegister
  );

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  /* reset state on unmount */
  useEffect(() => {
    return () => {
      dispatch(resetAdminRegisterState());
    };
  }, [dispatch]);

  /* success handling */
  useEffect(() => {
    if (success) {
      toast.success("Admin account created successfully!");
      navigate("/", { replace: true });
    }
  }, [success, navigate]);

  /* error handling */
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminRegisterError());
    }
  }, [error, dispatch]);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateAdminRegisterFields({
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
      type: ADMIN_REGISTER_REQUEST,
      payload: {
        username,
        email,
        password,
      },
    });
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
            Create Admin Account
          </h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Register as an administrator
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput
            label="Username"
            value={username}
            placeholder="Enter username"
            onChange={(v) => handleFieldChange("username", v)}
            error={errors.username}
            disabled={loading}
            isDarkMode={isDarkMode}
          />

          <AuthInput
            label="Email Address"
            value={email}
            placeholder="Enter email"
            onChange={(v) => handleFieldChange("email", v)}
            error={errors.email}
            disabled={loading}
            isDarkMode={isDarkMode}
          />

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

          <div
            className={`p-3 rounded-lg ${isDarkMode
                ? "bg-blue-900/20 border border-blue-700"
                : "bg-blue-50 border border-blue-200"
              }`}
          >
            <p
              className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-700"
                }`}
            >
              This account will have administrator privileges
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
          >
            {loading ? "Creating..." : "Create Admin Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Already have an account?{" "}
          </span>
          <Link
            to="/login"
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
