import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import { CHANGE_PASSWORD_REQUEST } from "../../features/auth/changePassword/type";
import {
  clearChangePasswordError,
  resetChangePasswordState,
} from "../../features/auth/changePassword/reducer";
// import { toast } from "react-toastify"; // Removed as toast is handled in saga
import { validateChangePasswordFields } from "../../utilis/fieldValidations";
import AuthInput from "../../components/ui/AuthInput";
import { Loader2 } from "lucide-react";

const ChangePassword = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();

  const { loading, error, success } = useSelector(
    (state) => state.changePassword
  );

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      dispatch(resetChangePasswordState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      // toast.success("Password changed successfully!"); // handled in saga
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      // toast.error(error); // handled in saga
      dispatch(clearChangePasswordError());
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateChangePasswordFields({
      oldPassword,
      newPassword,
      confirmPassword,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    dispatch({
      type: CHANGE_PASSWORD_REQUEST,
      payload: {
        oldPassword,
        newPassword,
        confirmPassword,
      },
    });
  };

  const handleFieldChange = (field, value) => {
    if (field === "oldPassword") setOldPassword(value);
    if (field === "newPassword") setNewPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);

    if (errors[field]) {
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors[field];
        return updatedErrors;
      });
    }
  };

  return (
    <div
      className={`mt-10 flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
    >
      <div
        className={`p-8 rounded-xl shadow-2xl w-full max-w-md ${isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
      >
        <h2
          className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? "text-white" : "text-gray-900"
            }`}
        >
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Old Password */}
          <div>
            <AuthInput
              label="Old Password"
              type="password"
              value={oldPassword}
              placeholder="Enter old password"
              onChange={(v) => handleFieldChange("oldPassword", v)}
              error={errors.oldPassword}
              disabled={loading}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* New Password */}
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

          {/* Confirm Password */}
          <div>
            <AuthInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              placeholder="Confirm password"
              onChange={(v) => handleFieldChange("confirmPassword", v)}
              error={errors.confirmPassword}
              disabled={loading}
              isDarkMode={isDarkMode}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Updating...</span>
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
