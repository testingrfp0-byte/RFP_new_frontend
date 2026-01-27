import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SIMPLE_EMAIL_VERIFY_REQUEST } from "../../features/auth/emailVerification/type";
import {
  clearSimpleEmailVerificationError,
  resetSimpleEmailVerificationState,
} from "../../features/auth/emailVerification/reducer";
import { toast } from "react-toastify";

export const SimpleEmailVerification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, success, error } = useSelector(
    (state) => state.simpleEmailVerification
  );

  const queryParams = new URLSearchParams(location.search);
  const otp = queryParams.get("otp");
  const email = queryParams.get("email");
  const password = queryParams.get("password");
  const role = queryParams.get("role") || "user";

  /* reset state on unmount */
  useEffect(() => {
    return () => {
      dispatch(resetSimpleEmailVerificationState());
    };
  }, [dispatch]);

  /* trigger verification */
  useEffect(() => {
    if (otp && email) {
      dispatch({
        type: SIMPLE_EMAIL_VERIFY_REQUEST,
        payload: { otp, email, role },
      });
    } else {
      toast.error("Invalid verification link.");
    }
  }, [dispatch, otp, email, role]);

  /* success handling */
  useEffect(() => {
    if (success) {
      toast.success("Your email has been verified!");
      navigate("/register-verified", {
        state: { email, password, role },
        replace: true,
      });
    }
  }, [success, navigate, email, password, role]);

  /* error handling */
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearSimpleEmailVerificationError());
    }
  }, [error, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading && <h2>Verifying your email...</h2>}
      {!loading && !success && !error && <h2>Preparing verification...</h2>}
    </div>
  );
};
