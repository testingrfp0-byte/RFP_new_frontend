import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [userProfileImage, setUserProfileImage] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem("session");

    if (session) {
      const parsedSession = JSON.parse(session);

      if (parsedSession.user && parsedSession.user.image_base64) {
        setUserProfileImage(parsedSession.user.image_base64);
      }
    }
  }, []);

  const updateProfileImage = (imageBase64) => {
    setUserProfileImage(imageBase64);

    const session = localStorage.getItem("session");
    if (session) {
      const parsedSession = JSON.parse(session);

      const updatedSession = {
        ...parsedSession,
        user: {
          ...parsedSession.user,
          image_base64: imageBase64,
        },
      };

      localStorage.setItem("session", JSON.stringify(updatedSession));
    }
  };

  return (
    <UserContext.Provider value={{ userProfileImage, updateProfileImage }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
