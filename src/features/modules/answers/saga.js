import { call, put, takeEvery } from "redux-saga/effects";
import api from "../../../services/apiHelper";
import { ANSWER_URLS } from "../../../services/urlServices";
import { toast } from "react-toastify";

import {
  generateAnswerRequest,
  generateAnswerSuccess,
  generateAnswerFailure,

  updateAnswerRequest,
  updateAnswerSuccess,
  updateAnswerFailure,

  submitAnswerRequest,
  submitAnswerSuccess,
  submitAnswerFailure,

  notForMeRequest,
  notForMeSuccess,
  notForMeFailure,

  fetchVersionsRequest,
  fetchVersionsSuccess,
  fetchVersionsFailure,

  analyzeAnswerRequest,
  analyzeAnswerSuccess,
  analyzeAnswerFailure,

  submitChatPromptRequest,
  submitChatPromptSuccess,
  submitChatPromptFailure,

} from "./answersSlice";

import { updateQuestionLocally, fetchAssignedQuestionsRequest } from "../questions/questionsSlice";

function* generateAnswerWorker(action) {
  const questionId = action.payload;

  try {
    const response = yield call(
      api.get,
      ANSWER_URLS.GENERATE(questionId)
    );

    const answer =
      response.data?.new_answer_version?.answer ||
      response.data.answer ||
      response.data.generated_answer ||
      response.data.response ||
      "";

    // Extract answer_id from response if available
    const answerId = response.data?.new_answer_version?.id || response.data.answer_id || response.data.id || null;

    yield put(
      updateQuestionLocally({
        questionId,
        updates: {
          answer,
          answer_id: answerId,
          submit_status: "process" // Set status to "process" after generation
        },
      })
    );

    yield put(generateAnswerSuccess({ questionId }));
    yield put(fetchVersionsRequest(questionId));

    // Show success toast
    toast.success("Answer generated successfully!");
  } catch (error) {
    yield put(
      generateAnswerFailure({
        questionId,
        error: error.response?.data?.detail || error.message,
      })
    );

    // Show error toast
    toast.error("Failed to generate answer. Please try again.");
  }
}

function* updateAnswerWorker(action) {
  const { questionId, answer } = action.payload;
  try {
    const response = yield call(
      api.patch,
      ANSWER_URLS.UPDATE(questionId),
      { answer }
    );

    yield put(updateAnswerSuccess({ questionId }));

    if (response.data?.version) {
      yield put(fetchVersionsRequest(questionId));
    }
  } catch (error) {
    yield put(
      updateAnswerFailure({
        error: error.response?.data?.detail || error.message,
      })
    );
  }
}

function* submitAnswerWorker(action) {
  const { questionId, answer } = action.payload;
  try {
    yield call(
      api.patch,
      ANSWER_URLS.SUBMIT,
      { answer }, // Body
      {
        params: {
          question_id: questionId,
          status: "submitted",
        },
      }
    );

    yield put(
      updateQuestionLocally({
        questionId,
        updates: {
          submit_status: "submitted",  // Changed from 'status' to 'submit_status'
          is_submitted: true
        },
      })
    );

    yield put(submitAnswerSuccess({ questionId })); // Pass questionId
    yield put(fetchAssignedQuestionsRequest());
  } catch (error) {
    yield put(
      submitAnswerFailure({
        error: error.response?.data?.detail || error.message,
      })
    );
  }
}

function* notForMeWorker(action) {
  const questionId = action.payload;
  try {
    yield call(
      api.patch,
      ANSWER_URLS.SUBMIT,
      {}, // Empty body
      {
        params: {
          question_id: questionId,
          status: "not submitted",
        },
      }
    );

    yield put(
      updateQuestionLocally({
        questionId,
        updates: {
          answer: "",
          submit_status: "not submitted"  // Changed from 'status' to 'submit_status'
        },
      })
    );

    yield put(notForMeSuccess({ questionId })); // Pass questionId
    yield put(fetchAssignedQuestionsRequest());

    // Show success toast
    toast.success("Marked as Not for Me");
  } catch (error) {
    yield put(
      notForMeFailure({
        error: error.response?.data?.detail || error.message,
      })
    );

    // Show error toast with the actual API error message
    toast.error(error.response?.data?.message || error.response?.data?.detail || error.message || "Failed to mark as Not for Me");
  }
}

function* fetchVersionsWorker(action) {
  const questionId = action.payload;
  try {
    const response = yield call(
      api.get,
      ANSWER_URLS.VERSIONS(questionId)
    );

    yield put(
      fetchVersionsSuccess({
        questionId,
        versions: response.data.versions || [],
      })
    );
  } catch (error) {
    yield put(
      fetchVersionsFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

function* analyzeAnswerWorker(action) {
  const { rfpId, questionId } = action.payload;

  try {
    const response = yield call(
      api.post,
      ANSWER_URLS.ANALYZE,
      null,
      {
        params: {
          rfp_id: rfpId,
          question_id: questionId,
        },
      }
    );

    yield put(
      analyzeAnswerSuccess({
        questionId,
        result: response.data,
      })
    );
  } catch (error) {
    yield put(
      analyzeAnswerFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

function* submitChatPromptWorker(action) {
  const { quesId, chatMessage, userId } = action.payload;

  try {
    const response = yield call(
      api.post,
      ANSWER_URLS.CHAT_PROMPT,
      {
        ques_id: quesId,
        chat_message: chatMessage,
        user_id: userId,
      }
    );

    // Extract answer and answer_id if returned from API
    const answer = response.data?.new_answer_version?.answer || response.data?.answer;
    const answerId = response.data?.new_answer_version?.id || response.data?.answer_id || null;

    if (answer) {
      yield put(
        updateQuestionLocally({
          questionId: quesId,
          updates: {
            answer: answer,
            answer_id: answerId,  // Update answer_id
            submit_status: "process"  // Set status to process
          },
        })
      );
    }

    yield put(submitChatPromptSuccess({ questionId: quesId }));

    // Show success toast
    toast.success("Answer generated & stored in version");
  } catch (error) {
    yield put(
      submitChatPromptFailure(
        error.response?.data?.detail || error.message
      )
    );

    // Show error toast
    toast.error("Failed to process prompt. Please try again.");
  }
}

export default function* answersSaga() {
  yield takeEvery(generateAnswerRequest.type, generateAnswerWorker);
  yield takeEvery(updateAnswerRequest.type, updateAnswerWorker);
  yield takeEvery(submitAnswerRequest.type, submitAnswerWorker);
  yield takeEvery(notForMeRequest.type, notForMeWorker);
  yield takeEvery(fetchVersionsRequest.type, fetchVersionsWorker);
  yield takeEvery(analyzeAnswerRequest.type, analyzeAnswerWorker);
  yield takeEvery(submitChatPromptRequest.type, submitChatPromptWorker);
}
