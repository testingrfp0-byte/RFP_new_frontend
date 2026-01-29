import AuthInput from "./AuthInput";

export default function AddTeamUserModal({
    isOpen,
    onClose,
    onSubmit,
    isDarkMode,
    name,
    email,
    role,
    loading,
    errors,
    handleFieldChange,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
            <div
                className={`relative rounded-xl shadow-2xl p-6 w-full max-w-md transition-colors ${isDarkMode
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                    }`}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 text-xl ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"
                        }`}
                >
                    ✕
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h3
                        className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                    >
                        Add Team Member
                    </h3>
                    <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                        Invite a new member to your team and assign their role.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-4">
                    <AuthInput
                        label="Full Name"
                        value={name}
                        placeholder="Enter full name"
                        onChange={(v) => handleFieldChange("name", v)}
                        error={errors?.name}
                        isDarkMode={isDarkMode}
                        disabled={loading}
                    />

                    <AuthInput
                        label="Email Address"
                        value={email}
                        placeholder="Enter email"
                        onChange={(v) => handleFieldChange("email", v)}
                        error={errors?.email}
                        isDarkMode={isDarkMode}
                        disabled={loading}
                    />

                    {/* Role Dropdown */}
                    <div className="flex flex-col gap-1.5">
                        <label className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Assign Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => handleFieldChange("role", e.target.value)}
                            disabled={loading}
                            className={`w-full p-3 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-purple-500/50 ${isDarkMode
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-gray-50 border-gray-300 text-gray-900"
                                }`}
                        >
                            <option value="reviewer">Reviewer</option>
                            <option value="admin">Admin</option>
                        </select>
                        {errors?.role && (
                            <span className="text-red-500 text-xs mt-1">{errors.role}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-purple-500/30 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Adding Member...
                            </div>
                        ) : (
                            "Add Team Member"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}