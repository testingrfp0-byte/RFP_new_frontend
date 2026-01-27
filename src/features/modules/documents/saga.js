import { call, put, takeLatest, takeEvery } from "redux-saga/effects";
import api from "../../../services/apiHelper";
import { DOCUMENT_URLS } from "../../../services/urlServices";

import {
  fetchDocumentsRequest,
  fetchDocumentsSuccess,
  fetchDocumentsFailure,

  fetchDocumentDetailsRequest,
  fetchDocumentDetailsSuccess,
  fetchDocumentDetailsFailure,

  deleteDocumentRequest,
  deleteDocumentSuccess,
  deleteDocumentFailure,

  startAiAnalysisRequest,
  startAiAnalysisSuccess,
  startAiAnalysisFailure,

  generateDocumentRequest,
  generateDocumentSuccess,
  generateDocumentFailure,

  fetchFilterDataRequest,
  fetchFilterDataSuccess,
  fetchFilterDataFailure,
} from "./documentsSlice";

function* fetchDocumentsWorker() {
  try {
    const response = yield call(api.get, DOCUMENT_URLS.LIST);
    yield put(fetchDocumentsSuccess(response.data));
  } catch (error) {
    yield put(
      fetchDocumentsFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

function* fetchDocumentDetailsWorker(action) {
  const { id, status = "total question", onSuccess, onError } = action.payload;
  try {
    const response = yield call(
      api.get,
      `${DOCUMENT_URLS.DETAILS(id)}/${status}`
    );

    const flattenedQuestions =
      response.data.questions_by_section?.flatMap((section) =>
        section.questions.map((question) => ({
          ...question,
          section: section.section,
        }))
      ) || [];

    yield put(
      fetchDocumentDetailsSuccess({
        ...response.data,
        questions: flattenedQuestions,
      })
    );
    if (onSuccess) onSuccess(response.data);
  } catch (error) {
    const msg = error.response?.data?.detail || error.message;
    yield put(fetchDocumentDetailsFailure(msg));
    if (onError) onError(error);
  }
}

function* deleteDocumentWorker(action) {
  try {
    const rfpId = action.payload;
    yield call(api.delete, DOCUMENT_URLS.DELETE(rfpId));
    yield put(deleteDocumentSuccess(rfpId));
  } catch (error) {
    yield put(
      deleteDocumentFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

function* startAiAnalysisWorker(action) {
  const { rfpId, onSuccess, onError } = action.payload;
  try {
    // const rfpId = action.payload;

    const response = yield call(
      api.post,
      DOCUMENT_URLS.AI_ANALYSIS(rfpId)
    );

    localStorage.setItem(
      `aiAnalysisResults_${rfpId}`,
      JSON.stringify(response.data)
    );

    yield put(
      startAiAnalysisSuccess({
        rfpId,
        results: response.data,
      })
    );
    if (onSuccess) onSuccess();

  } catch (error) {
    yield put(startAiAnalysisFailure(error.response?.data));
    if (onError) onError(error);

  }
}

function* generateDocumentWorker(action) {
  const { rfpId, onSuccess, onError } = action.payload;

  try {
    const response = yield call(
      api.post,
      DOCUMENT_URLS.GENERATE(rfpId)
    );

    yield put(generateDocumentSuccess(response.data));
    if (onSuccess) onSuccess();
  } catch (error) {
    yield put(generateDocumentFailure(error.response?.data));
    if (onError) onError(error);
  }
}

function* fetchFilterDataWorker(action) {
  const { rfpId, onSuccess, onError } = typeof action.payload === 'object' ? action.payload : { rfpId: action.payload };
  try {
    const response = yield call(
      api.get,
      DOCUMENT_URLS.FILTER_DATA(rfpId)
    );

    yield put(fetchFilterDataSuccess(response.data));
    if (onSuccess) onSuccess(response.data);
  } catch (error) {
    const msg = error.response?.data?.detail || error.message;
    yield put(fetchFilterDataFailure(msg));
    if (onError) onError(error);
  }
}

export default function* documentsSaga() {
  yield takeLatest(fetchDocumentsRequest.type, fetchDocumentsWorker);
  yield takeEvery(fetchDocumentDetailsRequest.type, fetchDocumentDetailsWorker);
  yield takeEvery(deleteDocumentRequest.type, deleteDocumentWorker);
  yield takeEvery(startAiAnalysisRequest.type, startAiAnalysisWorker);
  yield takeEvery(generateDocumentRequest.type, generateDocumentWorker);
  yield takeEvery(fetchFilterDataRequest.type, fetchFilterDataWorker);
}
