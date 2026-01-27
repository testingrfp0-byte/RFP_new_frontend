import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import { VERIFY_OTP_REQUEST, RESEND_OTP_REQUEST } from "../../features/auth/verification/type";
import { clearVerificationError, resetVerificationState } from "../../features/auth/verification/reducer";
import { toast } from "react-toastify";
import { validateOtpFields } from "../../utilis/fieldValidations";
import AuthInput from "../../components/ui/AuthInput";

const VerifyEmailByOtp = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, success } = useSelector(
    (state) => state.verification
  );
  const otpData = location.state?.otpData || {};
  const email = otpData.email || "";
  const title = otpData.title || "register";
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(600);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      dispatch(resetVerificationState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Email verified successfully!");

      if (title === "register") {
        navigate("/login", { replace: true });
      } else {
        navigate("/reset-password", { state: { email } });
      }
    }
  }, [success, navigate, title, email]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearVerificationError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (resendTimer === 0) return;
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleVerify = (e) => {
    e.preventDefault();

    const validationErrors = validateOtpFields({ otp });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    dispatch({
      type: VERIFY_OTP_REQUEST,
      payload: { email, otp },
    });
  };

  const handleResendOtp = () => {
    dispatch({
      type: RESEND_OTP_REQUEST,
      payload: { email },
    });
    setResendTimer(600);
  };

  const handleOtpChange = (value) => {
    // allow only numbers
    if (!/^\d*$/.test(value)) return;

    setOtp(value);

    if (errors.otp) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.otp;
        return updated;
      });
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={isDarkMode ? "text-white" : "text-gray-900"}>
          No email found. Please register first.
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className={`p-8 rounded-xl shadow-2xl w-full max-w-md ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        <h2 className={`text-3xl font-bold text-center mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Verify Your Email
        </h2>

        <p className={`text-center mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Enter the OTP sent to <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <AuthInput
            label="OTP"
            value={otp}
            placeholder="Enter 4 digit OTP"
            onChange={(v) => handleOtpChange(v)}
            error={errors.otp}
            disabled={loading}
            isDarkMode={isDarkMode}
            inputMode="numeric"
            maxLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
          >
            {loading ? "Verifying..." : "Verify One Time OTP"}
          </button>
        </form>

        <div className="mt-6 text-center">
          {resendTimer > 0 ? (
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Resend OTP in {Math.floor(resendTimer / 60)}:
              {String(resendTimer % 60).padStart(2, "0")}
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              className="text-purple-400 hover:text-purple-300"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailByOtp;
