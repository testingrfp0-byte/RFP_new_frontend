import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PROFILE_URLS } from "../services/urlServices";
import { getAPI } from "../services/apiHelper";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserDetails = useCallback(async (userId) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await getAPI(PROFILE_URLS.USER_DETAILS(userId));
      const data = response.data;

      // email + username
      setUserEmail(data.email || null);
      setUserName(data.username || null);

      // avatar (state only)
      if (data.image_base64) {
        setUserProfileImage(data.image_base64);
      } else {
        setUserProfileImage(null); // 👤 fallback
      }

      const session = localStorage.getItem("session");
      if (session) {
        const parsedSession = JSON.parse(session);

        localStorage.setItem(
          "session",
          JSON.stringify({
            ...parsedSession,
            email: data.email || parsedSession.email,
            username: data.username || parsedSession.username,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const session = localStorage.getItem("session");

    if (!session) return;

    try {
      const parsedSession = JSON.parse(session);

      // Clean up any old image_base64 data to prevent 431 errors
      if (parsedSession.image_base64 || parsedSession.image_name) {
        const cleanedSession = { ...parsedSession };
        delete cleanedSession.image_base64;
        delete cleanedSession.image_name;
        localStorage.setItem("session", JSON.stringify(cleanedSession));
      }

      setUserEmail(parsedSession.email || null);
      setUserName(parsedSession.username || null);

      // never load avatar from localStorage
      setUserProfileImage(null);

      if (parsedSession.userId) {
        fetchUserDetails(parsedSession.userId);
      }
    } catch { }
  }, [fetchUserDetails]);

  // image update (NO localStorage)
  const updateProfileImage = useCallback((imageBase64) => {
    setUserProfileImage(imageBase64 || null);
  }, []);

  // email / username update
  const updateUserDetails = useCallback((email, username) => {
    if (email) setUserEmail(email);
    if (username) setUserName(username);

    const session = localStorage.getItem("session");
    if (session) {
      const parsedSession = JSON.parse(session);

      localStorage.setItem(
        "session",
        JSON.stringify({
          ...parsedSession,
          ...(email && { email }),
          ...(username && { username }),
        })
      );
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        userProfileImage,
        userEmail,
        userName,
        updateProfileImage,
        updateUserDetails,
        isLoading,
        fetchUserDetails,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
