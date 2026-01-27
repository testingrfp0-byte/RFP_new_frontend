import { all } from "redux-saga/effects";

import loginSaga from "../features/auth/login/saga";
import registerSaga from "../features/auth/register/saga";
import verificationSaga from "../features/auth/verification/saga";
import forgotPasswordSaga from "../features/auth/forgotPassword/saga";
import resetPasswordSaga from "../features/auth/resetPassword/saga";
import changePasswordSaga from "../features/auth/changePassword/saga";
import adminRegisterSaga from "../features/auth/adminRegister/saga";
import registerVerifiedSaga from "../features/auth/verifyRegistration/saga";
import simpleEmailVerificationSaga from "../features/auth/emailVerification/saga";
import userProfileSaga from "../features/profile/userProfile/saga";
import documentsSaga from "../features/modules/documents/saga";
import questionsSaga from "../features/modules/questions/saga";
import answersSaga from "../features/modules/answers/saga";
import usersSaga from "../features/modules/users/saga";
import assignmentsSaga from "../features/modules/assignments/saga";
import uploadSaga from "../features/report/saga";
import teamUsersSaga from "../features/team/teamUser/saga";
import librarySaga from "../features/library/librarySaga";
import recycleBinSaga from "../features/restore/recycleBinSaga";
import rfpReportSaga from "../features/report/rfpReport/rfpReportSaga";
import reviewerAssignedSaga from "../features/reviewerAssigned/reviewerAssignedSaga";
import keystoneSaga from "../features/keystone/keystoneSaga";

export default function* rootSaga() {
  yield all([
    loginSaga(),
    registerSaga(),
    verificationSaga(),
    forgotPasswordSaga(),
    resetPasswordSaga(),
    changePasswordSaga(),
    adminRegisterSaga(),
    registerVerifiedSaga(),
    simpleEmailVerificationSaga(),
    userProfileSaga(),
    documentsSaga(),
    questionsSaga(),
    answersSaga(),
    usersSaga(),
    assignmentsSaga(),
    uploadSaga(),
    teamUsersSaga(),
    librarySaga(),
    recycleBinSaga(),
    rfpReportSaga(),
    reviewerAssignedSaga(),
    keystoneSaga(),
  ]);
}
