import { call, put, takeLatest, takeEvery } from "redux-saga/effects";
import api from "../../services/apiHelper";
import * as TYPES from "./libraryType";
import { LIBRARY_URLS } from "../../services/urlServices";
import { toast } from "react-toastify";

function* fetchLibrarySaga() {
  try {
    const res = yield call(api.get, LIBRARY_URLS.LIST);

    yield put({
      type: TYPES.FETCH_LIBRARY_SUCCESS,
      payload: res.data || [],
    });
  } catch (error) {
    yield put({
      type: TYPES.FETCH_LIBRARY_FAILURE,
      payload: error.message,
    });
    toast.error("Failed to load library");
  }
}

function* deleteLibrarySaga(action) {
  try {
    yield call(api.delete, LIBRARY_URLS.DELETE(action.payload));

    yield put({ type: TYPES.DELETE_LIBRARY_SUCCESS });
    toast.success("Document deleted successfully");

    // refresh list
    yield put({ type: TYPES.FETCH_LIBRARY_REQUEST });
  } catch (error) {
    yield put({
      type: TYPES.DELETE_LIBRARY_FAILURE,
      payload: error.message,
    });
    toast.error("Delete failed");
  }
}

function* viewLibrarySaga(action) {
  try {
    const res = yield call(api.get, LIBRARY_URLS.VIEW(action.payload), {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(res.data);
    window.open(url, "_blank");
  } catch (error) {
    yield put({
      type: TYPES.VIEW_LIBRARY_FAILURE,
      payload: error.message,
    });
    toast.error("Failed to open document");
  }
}

function* uploadLibrarySaga(action) {
  const { file, category, projectName, onSuccess, onError, provider, customMessage } = action.payload;

  try {
    const formData = new FormData();
    if (category === "history") {
      formData.append("file", file);
      formData.append("project_name", projectName);
    } else if (category === "Client and Industry Background") {
      formData.append("file", file);
      formData.append("project_name", projectName);
    } else {
      formData.append("files", file);
      formData.append("category", category);
      formData.append("project_name", projectName);
    }

    if (provider && category !== "Client and Industry Background") {
      formData.append("provider", provider);
    }

    if (customMessage) {
      formData.append("custom_message", customMessage);
    }

    const url =
      category === "history"
        ? LIBRARY_URLS.ANALYZE
        : category === "Client and Industry Background"
          ? LIBRARY_URLS.UPLOAD_BACKGROUND
          : LIBRARY_URLS.UPLOAD;

    const res = yield call(api.post, url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.status === 208 || res.data?.status === 'error') {
      const error = new Error("Duplicate or Error");
      error.response = res;
      throw error;
    }

    yield put({ type: TYPES.UPLOAD_LIBRARY_SUCCESS });

    let successMessage;

    if (category === "history") {
      successMessage = "Uploaded Successfully";
    } else {
      successMessage =
        res?.data?.message ||
        res?.data?.detail ||
        `${file.name} uploaded successfully!`;
    }

    toast.success(successMessage);

    yield put({ type: TYPES.FETCH_LIBRARY_REQUEST });

    if (onSuccess) onSuccess();
  } catch (error) {
    yield put({
      type: TYPES.UPLOAD_LIBRARY_FAILURE,
      payload: error.message,
    });

    let errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      `Failed to upload ${file.name}`;

    if (
      error.response?.status === 208 ||
      (error.response?.data?.message?.status === "duplicate" && error.response?.data?.message?.message)
    ) {
      errorMessage = error.response.data.message.message;
    }

    toast.error(errorMessage);

    if (onError) onError();
  }
}


export default function* librarySaga() {
  yield takeLatest(TYPES.FETCH_LIBRARY_REQUEST, fetchLibrarySaga);
  yield takeLatest(TYPES.DELETE_LIBRARY_REQUEST, deleteLibrarySaga);
  yield takeLatest(TYPES.VIEW_LIBRARY_REQUEST, viewLibrarySaga);
  yield takeEvery(TYPES.UPLOAD_LIBRARY_REQUEST, uploadLibrarySaga);
}