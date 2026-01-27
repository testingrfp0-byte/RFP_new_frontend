import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import { REGISTER_VERIFIED_REQUEST } from "../../features/auth/verifyRegistration/type";
import {
  clearRegisterVerifiedError,
  resetRegisterVerifiedState,
} from "../../features/auth/verifyRegistration/reducer";
import { toast } from "react-toastify";
import { validateRegisterVerifiedFields } from "../../utilis/fieldValidations";
import AuthInput from "../../components/ui/AuthInput";

export default function RegisterVerification() {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const { loading, error, success } = useSelector(
    (state) => state.registerVerified
  );
  const email = location.state?.email || "";
  const oldPassword = location.state?.password || "";
  const role = location.state?.role || "user";

  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  /* reset state on unmount */
  useEffect(() => {
    return () => {
      dispatch(resetRegisterVerifiedState());
    };
  }, [dispatch]);

  /* success handling */
  useEffect(() => {
    if (success) {
      toast.success("Account setup completed successfully!");
      navigate("/login", { state: { email }, replace: true });
    }
  }, [success, navigate, email]);

  /* error handling */
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearRegisterVerifiedError());
    }
  }, [error, dispatch]);


  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateRegisterVerifiedFields({
      username,
      newPassword,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    dispatch({
      type: REGISTER_VERIFIED_REQUEST,
      payload: {
        username,
        email,
        oldPassword,
        newPassword,
        role,
      },
    });
  };

  const handleFieldChange = (field, value) => {
    if (field === "username") setUsername(value);
    if (field === "newPassword") setNewPassword(value);

    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  if (!email || !oldPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={isDarkMode ? "text-white" : "text-gray-900"}>
          Invalid access. Please restart registration.
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
            Complete Your Signup
          </h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Your email is verified. Set your details to finish.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput
            label="Username"
            value={username}
            placeholder="Choose username"
            onChange={(v) => handleFieldChange("username", v)}
            error={errors.username}
            disabled={loading}
            isDarkMode={isDarkMode}
          />

          <AuthInput
            label="Email"
            value={email}
            readOnly
            disabled
            isDarkMode={isDarkMode}
          />

          <AuthInput
            label="New Password"
            type="password"
            value={newPassword}
            placeholder="Create password"
            onChange={(v) => handleFieldChange("newPassword", v)}
            error={errors.newPassword}
            disabled={loading}
            isDarkMode={isDarkMode}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
          >
            {loading ? "Finishing..." : "Finish Signup"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-purple-400 hover:text-purple-300">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
