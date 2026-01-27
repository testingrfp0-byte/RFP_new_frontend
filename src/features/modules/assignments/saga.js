import { call, put, takeEvery } from "redux-saga/effects";
import api from "../../../services/apiHelper";
import { ASSIGNMENT_URLS } from "../../../services/urlServices";

import {
  submitAssignmentRequest,
  submitAssignmentSuccess,
  submitAssignmentFailure,
  assignReviewerRequest,
  assignReviewerSuccess,
  assignReviewerFailure,
  unassignReviewerRequest,
  unassignReviewerSuccess,
  unassignReviewerFailure,
  fetchAssignedReviewersRequest,
  fetchAssignedReviewersSuccess,
  fetchAssignedReviewersFailure,
} from "./assignmentsSlice";

import { fetchFilterDataRequest } from "../documents/documentsSlice";

function* assignReviewerWorker(action) {
  try {
    const {
      qIdx,
      users,
      questionId,
      fileId,
      onSuccess,
    } = action.payload;

    yield call(api.post, ASSIGNMENT_URLS.ASSIGN, {
      user_id: users.map((u) => u.user_id),
      ques_ids: [questionId],
      file_id: fileId,
      status: "assign",
    });

    yield put(assignReviewerSuccess({ qIdx, users }));

    yield put(fetchFilterDataRequest(fileId));

    if (onSuccess) onSuccess();
  } catch (error) {
    const msg = error.response?.data?.detail || error.message;

    yield put(assignReviewerFailure(msg));

    if (action.payload?.onError) {
      action.payload.onError(msg);
    }
  }
}

function* submitAssignmentWorker(action) {
  try {
    const { qIdx, users, questionId, fileId, onComplete } = action.payload;

    yield call(api.post, ASSIGNMENT_URLS.ASSIGN, {
      user_id: users.map((u) => u.user_id),
      ques_ids: [questionId],
      file_id: fileId,
      status: "assign",
    });

    yield put(fetchFilterDataRequest(fileId));

    yield call(api.post, ASSIGNMENT_URLS.SEND_NOTIFICATION, {
      user_id: users.map((u) => u.user_id),
      ques_ids: [questionId],
    });

    yield put(
      submitAssignmentSuccess({
        qIdx,
        users,
      })
    );

    if (onComplete) onComplete();

  } catch (error) {
    yield put(
      submitAssignmentFailure(
        error.response?.data?.detail || error.message
      )
    );

    if (action.payload?.onComplete) {
      action.payload.onComplete();
    }
  }
}

function* unassignReviewerWorker(action) {
  try {
    const { qIdx, user, questionId } = action.payload;

    yield call(
      api.delete,
      `${ASSIGNMENT_URLS.UNASSIGN}?ques_id=${questionId}&user_id=${user.user_id}`
    );

    yield put(
      unassignReviewerSuccess({
        qIdx,
        userId: user.user_id,
        username: user.username,
      })
    );
  } catch (error) {
    yield put(
      unassignReviewerFailure({
        qIdx: action.payload.qIdx,
        userId: action.payload.user.user_id,
        error: error.response?.data?.detail || error.message,
      })
    );
  }
}

function* fetchAssignedReviewersWorker(action) {
  const { documentId, onSuccess, onError } = action.payload;
  try {
    const response = yield call(
      api.get,
      ASSIGNMENT_URLS.ASSIGNED_REVIEWERS(documentId)
    );

    yield put(fetchAssignedReviewersSuccess(response.data));
    if (onSuccess) onSuccess(response.data);
  } catch (error) {
    const msg = error.response?.data?.detail || error.message;
    yield put(fetchAssignedReviewersFailure(msg));
    if (onError) onError(error);
  }
}

export default function* assignmentsSaga() {
  yield takeEvery(assignReviewerRequest.type, assignReviewerWorker);
  yield takeEvery(unassignReviewerRequest.type, unassignReviewerWorker);
  yield takeEvery(
    fetchAssignedReviewersRequest.type,
    fetchAssignedReviewersWorker
  );
  yield takeEvery(
    submitAssignmentRequest.type,
    submitAssignmentWorker
  );
}