import { call, put, takeLatest, takeEvery, all } from "redux-saga/effects";
import api from "../../../services/apiHelper";
import { QUESTION_URLS, QUESTION_STATUSES } from "../../../services/urlServices";

import {
  fetchAssignedQuestionsRequest,
  fetchAssignedQuestionsSuccess,
  fetchAssignedQuestionsFailure,

  fetchSubmittedQuestionsRequest,
  fetchSubmittedQuestionsSuccess,
  fetchSubmittedQuestionsFailure,

  fetchFilterQuestionsRequest,
  fetchFilterQuestionsSuccess,
  fetchFilterQuestionsFailure,

  addQuestionRequest,
  addQuestionSuccess,
  addQuestionFailure,

  deleteQuestionRequest,
  deleteQuestionSuccess,
  deleteQuestionFailure,

  analyzeQuestionRequest,
  analyzeQuestionFailure,

  reassignQuestionRequest,
  reassignQuestionSuccess,
  reassignQuestionFailure,

  updateAdminAnswerRequest,
  updateAdminAnswerSuccess,
  updateAdminAnswerFailure,

  fetchCheckSubmitRequest,
  fetchCheckSubmitSuccess,
  fetchCheckSubmitFailure,

  fetchEditApprovePageFailure,
  fetchEditApprovePageRequest,
  fetchEditApprovePageSuccess
} from "./questionsSlice";
import { fetchAssignedReviewersRequest } from "../assignments/assignmentsSlice";
import { fetchFilterDataRequest } from "../documents/documentsSlice";

const mapQuestion = (q, index) => ({
  question_id: q.question_id || `temp-${index}`,
  question_text: q.question,
  answer: q.answer,
  status: q.status,
  username: q.username,
  document_name: q.filename || "Unknown Filename",
  submitted_at: q.submitted_at,
  user_id: q.user_id,
  file_id: q.file_id,
});

function* fetchAssignedQuestionsWorker() {
  try {
    const response = yield call(api.get, QUESTION_URLS.ASSIGNED);
    yield put(fetchAssignedQuestionsSuccess(response.data));
  } catch (error) {
    yield put(
      fetchAssignedQuestionsFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

function* fetchSubmittedQuestionsWorker() {
  try {
    const response = yield call(api.get, QUESTION_URLS.SUBMITTED);

    const mapped = response.data.data.map((q, idx) => ({
      question_id: q.question_id || `temp-${idx}`,
      question_text: q.question,
      answer: q.answer,
      submit_status: q.status,
      username: q.username,
      rfp_id: q.file_id,
      filename: q.filename,
      submitted_at: q.submitted_at,
    }));

    yield put(fetchSubmittedQuestionsSuccess(mapped));
  } catch (error) {
    yield put(
      fetchSubmittedQuestionsFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

function* fetchFilterQuestionsWorker() {
  try {
    const statuses = [
      QUESTION_STATUSES.SUBMITTED,
      QUESTION_STATUSES.NOT_SUBMITTED,
      QUESTION_STATUSES.PROCESS,
    ];

    const counts = {
      submitted: 0,
      notSubmitted: 0,
      process: 0,
      total: 0,
    };

    let allQuestions = [];

    for (const status of statuses) {
      const response = yield call(
        api.get,
        `${QUESTION_URLS.FILTER}/${encodeURIComponent(status)}`
      );

      // Update counts
      if (status === QUESTION_STATUSES.SUBMITTED)
        counts.submitted = response.data.count || 0;
      else if (status === QUESTION_STATUSES.NOT_SUBMITTED)
        counts.notSubmitted = response.data.count || 0;
      else if (status === QUESTION_STATUSES.PROCESS)
        counts.process = response.data.count || 0;

      // Normalize data structure to match what the UI expects
      const statusQuestions = (response.data.questions || []).map((q) => ({
        ...q,
        // Ensure question_id exists (check both id and question_id from backend)
        question_id: q.question_id || q.id,
        // Ensure rfp_id exists (check file_id or rfp_id)
        rfp_id: q.rfp_id || q.file_id,
        // The UI relies on 'answer' existing, even if null
        answer: q.answer || "",
        submit_status: status,
      }));

      allQuestions = [...allQuestions, ...statusQuestions];
    }

    counts.total = counts.submitted + counts.notSubmitted + counts.process;

    yield put(fetchFilterQuestionsSuccess({
      counts,
      questions: allQuestions
    }));
  } catch (error) {
    yield put(
      fetchFilterQuestionsFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

function* addQuestionWorker(action) {
  try {
    const { id, questions } = action.payload;
    yield call(api.post, QUESTION_URLS.ADD(id), { questions });
    yield put(addQuestionSuccess());
  } catch (error) {
    yield put(
      addQuestionFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

function* deleteQuestionWorker(action) {
  try {
    const { questionId, rfpId, onSuccess } = action.payload;

    const response = yield call(
      api.delete,
      QUESTION_URLS.DELETE(questionId)
    );

    if (response?.data?.status === "error") {
      throw new Error(response.data.message);
    }

    yield put(deleteQuestionSuccess(questionId));

    yield put(fetchAssignedReviewersRequest(rfpId));

    yield put(fetchFilterDataRequest(rfpId));

    const totalQuestionRes = yield call(
      api.get,
      QUESTION_URLS.TOTAL_QUESTION(rfpId)
    );

    console.log(
      "Total question response:",
      totalQuestionRes.data
    );

    if (onSuccess) {
      onSuccess(
        response.data.message || "Question deleted successfully"
      );
    }

  } catch (error) {
    const msg =
      error.message ||
      error.response?.data?.message ||
      "Failed to delete question";

    if (action.payload?.onError) {
      action.payload.onError(msg);
    }

    yield put(deleteQuestionFailure(msg));
  }
}

function* analyzeQuestionWorker(action) {
  try {
    const { rfpId, questionId } = action.payload;
    yield call(
      api.post,
      `${QUESTION_URLS.ANALYZE}?rfp_id=${rfpId}&question_id=${questionId}`
    );
  } catch (error) {
    yield put(
      analyzeQuestionFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

function* reassignQuestionWorker(action) {
  try {
    const { onSuccess, onError, ...payload } = action.payload;
    const response = yield call(api.post, QUESTION_URLS.REASSIGN, payload);
    yield put(reassignQuestionSuccess());
    if (onSuccess) {
      onSuccess(response.data);
    }
  } catch (error) {
    if (action.payload?.onError) {
      action.payload.onError(error);
    }
    yield put(
      reassignQuestionFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

function* updateAdminAnswerWorker(action) {
  try {
    const { questionId, answer, onSuccess } = action.payload;

    const response = yield call(api.patch, QUESTION_URLS.ADMIN_UPDATE, {
      question_id: questionId,
      answer,
    });

    yield put(updateAdminAnswerSuccess({ questionId, answer }));

    if (onSuccess) {
      onSuccess(response.data);
    }
  } catch (error) {
    if (action.payload?.onError) {
      action.payload.onError(error);
    }
    yield put(
      updateAdminAnswerFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

function* fetchCheckSubmitSaga() {
  try {
    const response = yield call(api.get, QUESTION_URLS.CHECK_SUBMIT);
    yield put(fetchCheckSubmitSuccess(response.data.data || []));
  } catch (error) {
    yield put(
      fetchCheckSubmitFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

function* fetchEditApprovePageWorker() {
  try {
    const [
      checkSubmitRes,
      submittedRes,
      notSubmittedRes,
      processRes,
    ] = yield all([
      call(api.get, QUESTION_URLS.CHECK_SUBMIT),
      call(api.get, `${QUESTION_URLS.FILTER}/${encodeURIComponent("submitted")}`),
      call(api.get, `${QUESTION_URLS.FILTER}/${encodeURIComponent("not submitted")}`),
      call(api.get, `${QUESTION_URLS.FILTER}/${encodeURIComponent("process")}`),
    ]);

    const submittedQuestions = submittedRes?.data?.data || [];
    const notSubmittedQuestions = notSubmittedRes?.data?.data || [];
    const processQuestions = processRes?.data?.data || [];

    const combinedQuestions = [
      ...submittedQuestions,
      ...notSubmittedQuestions,
      ...processQuestions,
    ].map(mapQuestion);

    yield put(
      fetchEditApprovePageSuccess({
        checkSubmit: checkSubmitRes?.data?.data || [],
        combinedQuestions,
      })
    );
  } catch (error) {
    yield put(
      fetchEditApprovePageFailure(
        error.response?.data?.detail || error.message || "Something went wrong"
      )
    );
  }
}

export default function* questionsSaga() {
  yield takeLatest(
    fetchAssignedQuestionsRequest.type,
    fetchAssignedQuestionsWorker
  );
  yield takeLatest(
    fetchSubmittedQuestionsRequest.type,
    fetchSubmittedQuestionsWorker
  );
  yield takeLatest(
    fetchFilterQuestionsRequest.type,
    fetchFilterQuestionsWorker
  );

  yield takeEvery(addQuestionRequest.type, addQuestionWorker);
  yield takeEvery(deleteQuestionRequest.type, deleteQuestionWorker);
  yield takeEvery(analyzeQuestionRequest.type, analyzeQuestionWorker);
  yield takeEvery(reassignQuestionRequest.type, reassignQuestionWorker);
  yield takeEvery(updateAdminAnswerRequest.type, updateAdminAnswerWorker);
  yield takeLatest(fetchCheckSubmitRequest.type, fetchCheckSubmitSaga);
  yield takeLatest(
    fetchEditApprovePageRequest.type,
    fetchEditApprovePageWorker
  );

}
