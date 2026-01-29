import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import { Link } from "react-router-dom";
import { validateUpdateProfileFields } from "../../utilis/fieldValidations";
import {
  USER_DETAILS_REQUEST,
  UPDATE_PROFILE_REQUEST,
} from "../../features/profile/userProfile/type";
import {
  resetUserDetailsState,
  resetUpdateProfileState,
} from "../../features/profile/userProfile/userProfileSlice";
import ToasterNotification from "../../components/ui/ToasterNotification";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { toast } from "react-toastify";
import { useUser } from "../../contexts/UserContext";

// Safe session parsing helper
const getSessionData = () => {
  try {
    const session = localStorage.getItem("session");
    if (!session) return null;
    return JSON.parse(session);
  } catch (error) {
    console.error("Error parsing session:", error);
    return null;
  }
};

const Profile = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const { updateProfileImage, updateUserDetails } = useUser();

  const { loading, data: user } = useSelector(
    (state) => state.profile
  );
  const { loading: updateLoading, success, error: updateError } = useSelector(
    (state) => state.updateProfile
  );
  const [error, setError] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [errors, setErrors] = useState({});

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [newProfileImageFile, setNewProfileImageFile] = useState(null);
  const [currentProfileImageUrl, setCurrentProfileImageUrl] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const successToastShown = useRef(false);

  // Safe session parsing with null checks
  const parsedSession = getSessionData();
  const userId = parsedSession?.userId;

  // Helper to check if string is likely base64 data
  const isBase64 = (str) => {
    if (!str || str.length < 20) return false;
    // Base64 uses A-Z, a-z, 0-9, +, /, and = for padding
    const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
    return base64Pattern.test(str);
  };

  // Safe image URL construction - handle base64, paths, and invalid formats
  const imageSrc = currentProfileImageUrl
    ? currentProfileImageUrl.startsWith("data:image")
      ? currentProfileImageUrl
      : currentProfileImageUrl.startsWith("uploads/") ||
        currentProfileImageUrl.startsWith("http://") ||
        currentProfileImageUrl.startsWith("https://") ||
        currentProfileImageUrl.startsWith("./") ||
        (currentProfileImageUrl.startsWith("/") && !isBase64(currentProfileImageUrl))
        ? null // Invalid path format, show fallback
        : `data:image/png;base64,${currentProfileImageUrl}`
    : null;

  // Debug logging
  // console.log('Profile Image Debug:', {
  //   currentProfileImageUrl: currentProfileImageUrl ? currentProfileImageUrl.substring(0, 50) + '...' : null,
  //   imageSrc: imageSrc ? imageSrc.substring(0, 70) + '...' : null,
  //   hasImage: !!imageSrc
  // });

  useEffect(() => {
    if (userId) {
      dispatch({
        type: USER_DETAILS_REQUEST,
        payload: { userId },
      });
    }

    return () => {
      dispatch(resetUserDetailsState());
      dispatch(resetUpdateProfileState());
    };
  }, [dispatch, userId]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setCurrentProfileImageUrl(user.image_base64 || null);
      setIsInitialLoad(false);

      // Update UserContext with new image whenever user data changes
      if (user.image_base64) {
        updateProfileImage(user.image_base64);
      }

      // Update UserContext with new email/username
      if (user.email || user.username) {
        updateUserDetails(user.email, user.username);
      }
    }
  }, [user, updateProfileImage, updateUserDetails]);

  useEffect(() => {
    if (success && !successToastShown.current) {
      successToastShown.current = true;
      setIsEditing(false);
      setImageFile(null);

      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Reset the ref and success state after allowing user details to update
      setTimeout(() => {
        successToastShown.current = false;
        dispatch(resetUpdateProfileState());
      }, 1000);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError || "Failed to update profile", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [updateError]);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateUpdateProfileFields({
      username,
      email,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const payload = { username, email };

    if (imageFile) {
      const base64 = await toBase64(imageFile);
      payload.image_name = imageFile.name;
      payload.image_base64 = base64;
    }

    dispatch({
      type: UPDATE_PROFILE_REQUEST,
      payload,
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setImageFile(file);
      setNewProfileImageFile(file);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleFieldChange = (field, value) => {
    if (field === "username") setUsername(value);
    if (field === "email") setEmail(value);

    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleCloseNotification = () => {
    setNotificationMessage("");
  };

  const inputClass = (field) =>
    `w-full p-3 rounded-lg border transition-colors
   ${errors[field]
      ? "border-red-500"
      : isDarkMode
        ? "border-gray-600"
        : "border-gray-300"
    }
   ${isDarkMode
      ? "bg-gray-700 text-white placeholder-gray-400"
      : "bg-gray-50 text-gray-900 placeholder-gray-500"
    }`;

  if (loading && isInitialLoad) {
    return <LoadingSpinner />;
  }

  return (
    <div
      className={`mt-2 mb-2 flex items-center justify-center transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
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
            User Profile
          </h2>
        </div>
        {!isEditing ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Profile Preview"
                  className="w-20 h-20 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-5xl ${isDarkMode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-200 text-gray-600"
                  }`}
                style={{ display: imageSrc ? 'none' : 'flex' }}
              >
                👤
              </div>
              <p
                className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
                  }`}
              >
                {username}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${isDarkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-800"
                }`}
            >
              <p className="font-medium">Username: {username}</p>
            </div>
            <div
              className={`p-4 rounded-lg ${isDarkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-800"
                }`}
            >
              <p className="font-medium">Email: {email}</p>
            </div>
            {error && (
              <p className="text-center text-red-500">Error: {error}</p>
            )}
            <div
              className={`p-4 rounded-lg ${isDarkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-800"
                }`}
            >
              <p className="font-medium">Password: ********</p>
              <p
                className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                To change your password, please go to the{" "}
                <Link
                  to="/change-password"
                  className="text-purple-400 hover:underline"
                >
                  Change Password
                </Link>{" "}
                page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleEditToggle}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <div
                className="relative group cursor-pointer"
                onClick={() =>
                  document.getElementById("profile-image-upload").click()
                }
              >
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {!imageFile && (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-5xl"
                    style={{ display: (imageFile || imageSrc) ? 'none' : 'flex' }}
                  >
                    👤
                  </div>
                )}

                <div
                  className={`absolute inset-0 w-20 h-20 rounded-full
  flex items-center justify-center
  bg-black text-white text-2xl
  opacity-0 group-hover:opacity-100
  transition-opacity
  ${isDarkMode ? "group-hover:bg-opacity-70" : "group-hover:bg-opacity-60"}
`}
                >
                  ✏️
                </div>
              </div>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
              >
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) =>
                  handleFieldChange("username", e.target.value)
                }
                className={inputClass("username")}
              />

              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
              >
                Email Address
              </label>
              <input
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  handleFieldChange("email", e.target.value)
                }
                className={inputClass("email")}
              />

              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleEditToggle}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Cancel Edit
            </button>
            <button
              type="submit"
              disabled={updateLoading}
              className={`w-full py-3 rounded-lg font-medium transition-colors mt-4
                ${updateLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
                }
              `}
            >
              {updateLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
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
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        )}
      </div>
      {notificationMessage && (
        <ToasterNotification
          message={notificationMessage}
          type={notificationType}
          onClose={handleCloseNotification}
        />
      )}
    </div>
  );
};

export default Profile;
