import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./rootSaga";
import loginReducer from "../features/auth/login/reducer";
import registerReducer from "../features/auth/register/reducer";
import verificationReducer from "../features/auth/verification/reducer";
import forgotPasswordReducer from "../features/auth/forgotPassword/reducer";
import resetPasswordReducer from "../features/auth/resetPassword/reducer";
import changePasswordReducer from "../features/auth/changePassword/reducer";
import adminRegisterReducer from "../features/auth/adminRegister/reducer";
import registerVerifiedReducer from "../features/auth/verifyRegistration/reducer";
import simpleEmailVerificationReducer from "../features/auth/emailVerification/reducer";
import {
  userDetailsReducer,
  updateProfileReducer,
} from "../features/profile/userProfile/userProfileSlice";
import documentsReducer from "../features/modules/documents/documentsSlice";
import questionsReducer from "../features/modules/questions/questionsSlice";
import answersReducer from "../features/modules/answers/answersSlice";
import usersReducer from "../features/modules/users/usersSlice";
import assignmentsReducer from "../features/modules/assignments/assignmentsSlice";
import uploadReducer from "../features/report/uploadSlice";
import recycleBinReducer from "../features/restore/recycleBinReducer";
import teamUsersReducer from "../features/team/teamUser/teamUserReducer";
import libraryReducer from "../features/library/libraryReducer";
import rfpReportReducer from "../features/report/rfpReport/rfpReportReducer";
import reviewerAssignedReducer from
  "../features/reviewerAssigned/reviewerAssignedReducer";
import keystoneReducer from "../features/keystone/keystoneReducer";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    login: loginReducer,
    register: registerReducer,
    verification: verificationReducer,
    forgotPassword: forgotPasswordReducer,
    resetPassword: resetPasswordReducer,
    changePassword: changePasswordReducer,
    adminRegister: adminRegisterReducer,
    registerVerified: registerVerifiedReducer,
    simpleEmailVerification: simpleEmailVerificationReducer,
    profile: userDetailsReducer,
    updateProfile: updateProfileReducer,
    documents: documentsReducer,
    questions: questionsReducer,
    answers: answersReducer,
    users: usersReducer,
    assignments: assignmentsReducer,
    upload: uploadReducer,
    recycleBin: recycleBinReducer,
    teamUsers: teamUsersReducer,
    library: libraryReducer,
    rfpReport: rfpReportReducer,
    reviewerAssigned: reviewerAssignedReducer,
    keystone: keystoneReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);
