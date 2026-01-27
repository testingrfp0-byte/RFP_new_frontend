import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const AuthInput = ({
    label,
    type = "text",
    value,
    placeholder,
    onChange,
    error,
    disabled = false,
    isDarkMode,
    readOnly = false,
    inputMode,
    maxLength,
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const inputClass = `
    w-full p-3 rounded-lg border transition-colors pr-12
    ${error ? "border-red-500" : isDarkMode ? "border-gray-600" : "border-gray-300"}
    ${isDarkMode
            ? "bg-gray-700 text-white placeholder-gray-400"
            : "bg-gray-50 text-gray-900 placeholder-gray-500"}
    focus:border-purple-500 focus:ring-1 focus:ring-purple-500
    disabled:opacity-50 disabled:cursor-not-allowed
    ${readOnly ? "cursor-not-allowed opacity-70" : ""}
  `;

    return (
        <div>
            {label && (
                <label
                    className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                >
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    type={inputType}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    readOnly={readOnly}
                    inputMode={inputMode}
                    maxLength={maxLength}
                    className={inputClass}
                />

                {isPassword && !readOnly && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded
              ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-700"}
            `}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>
                )}
            </div>

            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
        </div>
    );
};

export default AuthInput;
