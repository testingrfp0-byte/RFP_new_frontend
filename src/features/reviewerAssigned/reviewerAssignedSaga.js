import { call, put, takeLatest, all } from "redux-saga/effects";
import api from "../../services/apiHelper";
import * as TYPES from "./reviewerAssignedTypes";
import { toast } from "react-toastify";
import { REVIEWER_ASSIGNED_URLS } from "../../services/urlServices";

function* checkUserRoleSaga() {
  try {
    const res = yield call(api.get, REVIEWER_ASSIGNED_URLS.USERS);
    const session = JSON.parse(localStorage.getItem("session"));

    const user = res.data.find(
      (u) =>
        u.email === session?.email || u.username === session?.email
    );

    if (!user || user.role === "reviewer") {
      throw new Error("Unauthorized");
    }

    yield put({
      type: TYPES.CHECK_USER_ROLE_SUCCESS,
      payload: user.role,
    });
  } catch (error) {
    yield put({
      type: TYPES.CHECK_USER_ROLE_FAILURE,
      payload: error.message,
    });
  }
}

function* fetchReviewersSaga() {
  try {
    const res = yield call(api.get, REVIEWER_ASSIGNED_URLS.STATUS);
    const data = res.data.data || res.data;

    const reviewerMap = new Map();

    data.forEach((item) => {
      if (!reviewerMap.has(item.username)) {
        reviewerMap.set(item.username, {
          username: item.username,
          email: "",
          totalQuestions: 0,
          submittedQuestions: 0,
          pendingQuestions: 0,
        });
      }

      const reviewer = reviewerMap.get(item.username);
      reviewer.totalQuestions += 1;

      if (item.status === "submitted") {
        reviewer.submittedQuestions += 1;
      } else {
        reviewer.pendingQuestions += 1;
      }
    });

    yield put({
      type: TYPES.FETCH_REVIEWERS_SUCCESS,
      payload: Array.from(reviewerMap.values()),
    });
  } catch (error) {
    yield put({
      type: TYPES.FETCH_REVIEWERS_FAILURE,
      payload: "Failed to fetch reviewers",
    });
    toast.error("Failed to fetch reviewers");
  }
}

function* fetchReviewerQuestionsSaga(action) {
  try {
    const reviewerUsername = action.payload;

    const [statusRes, usersRes] = yield all([
      call(api.get, REVIEWER_ASSIGNED_URLS.STATUS),
      call(api.get, REVIEWER_ASSIGNED_URLS.USERS),
    ]);

    const statusData = statusRes.data.data || statusRes.data;
    const usersData = usersRes.data;

    const user = usersData.find(
      (u) => u.username === reviewerUsername
    );
    if (!user) throw new Error("Reviewer not found");

    const reviewerQuestions = statusData
      .filter((i) => i.username === reviewerUsername)
      .map((i) => ({
        ...i,
        user_id: user.user_id,
        // Fallback or data specific logic if needed, but removing the expensive lookups
        ques_id: i.ques_id || i.question_id || i.id || null,
      }));

    yield put({
      type: TYPES.FETCH_REVIEWER_QUESTIONS_SUCCESS,
      payload: {
        reviewer: reviewerUsername,
        questions: reviewerQuestions,
      },
    });
  } catch (error) {
    yield put({
      type: TYPES.FETCH_REVIEWER_QUESTIONS_FAILURE,
      payload: error.message,
    });
    toast.error("Failed to fetch reviewer questions");
  }
}

function* removeReviewerQuestionSaga(action) {
  try {
    yield call(api.delete, REVIEWER_ASSIGNED_URLS.REMOVE, {
      params: action.payload,
    });

    yield put({
      type: TYPES.REMOVE_REVIEWER_QUESTION_SUCCESS,
      payload: action.payload.ques_id,
    });

    toast.success("Question removed successfully");
    yield put({ type: TYPES.FETCH_REVIEWERS_REQUEST });
  } catch (error) {
    yield put({
      type: TYPES.REMOVE_REVIEWER_QUESTION_FAILURE,
      payload: error.message,
    });

    toast.error("Remove failed");
  }
}

export default function* reviewerAssignedSaga() {
  yield takeLatest(TYPES.CHECK_USER_ROLE_REQUEST, checkUserRoleSaga);
  yield takeLatest(TYPES.FETCH_REVIEWERS_REQUEST, fetchReviewersSaga);
  yield takeLatest(
    TYPES.FETCH_REVIEWER_QUESTIONS_REQUEST,
    fetchReviewerQuestionsSaga
  );
  yield takeLatest(
    TYPES.REMOVE_REVIEWER_QUESTION_REQUEST,
    removeReviewerQuestionSaga
  );
}
