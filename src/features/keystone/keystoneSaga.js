import { call, put, takeLatest } from "redux-saga/effects";
import api from "../../services/apiHelper";
import { toast } from "react-toastify";
import * as TYPES from "./keystoneTypes";
import { KEYSTONE_URLS } from "../../services/urlServices";

function* fetchKeystoneSaga() {
    try {
        const res = yield call(api.get, KEYSTONE_URLS.LIST);
        yield put({ type: TYPES.FETCH_KEYSTONE_SUCCESS, payload: res.data || [] });
    } catch (e) {
        yield put({ type: TYPES.FETCH_KEYSTONE_FAILURE, payload: e.message });
        toast.error("Failed to load keystone documents");
    }
}

function* uploadKeystoneSaga(action) {
  try {
    const formData = new FormData();

    // ✅ Must match backend field name exactly
    formData.append("file", action.payload.file);

    const res = yield call(
      api.post,
      KEYSTONE_URLS.UPLOAD,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // ✅ force multipart
        },
      }
    );

    yield put({ type: TYPES.UPLOAD_KEYSTONE_SUCCESS });
    toast.success(res.data?.message || "File uploaded successfully");

    yield put({ type: TYPES.FETCH_KEYSTONE_REQUEST });
  } catch (e) {
    yield put({
      type: TYPES.UPLOAD_KEYSTONE_FAILURE,
      payload: e.response?.data?.detail?.[0]?.msg || e.message,
    });

    toast.error(
      e.response?.data?.detail?.[0]?.msg || "Upload failed"
    );
  }
}

function* deleteKeystoneSaga(action) {
    try {
        const res = yield call(
            api.delete,
            KEYSTONE_URLS.DELETE(action.payload)
        );

        yield put({ type: TYPES.DELETE_KEYSTONE_SUCCESS });
        toast.success(res.data?.message || "File deleted successfully");

        yield put({ type: TYPES.FETCH_KEYSTONE_REQUEST });
    } catch (e) {
        yield put({
            type: TYPES.DELETE_KEYSTONE_FAILURE,
            payload: e.response?.data?.message || e.message,
        });
        toast.error(e.response?.data?.message || "Delete failed");
    }
}

function* viewKeystoneSaga(action) {
    try {
        const res = yield call(api.get, KEYSTONE_URLS.VIEW(action.payload), {
            responseType: "blob",
        });

        const url = window.URL.createObjectURL(res.data);
        window.open(url, "_blank");

        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 5000);
    } catch (e) {
        toast.error("Failed to open file");
    }
}

export default function* keystoneSaga() {
    yield takeLatest(TYPES.FETCH_KEYSTONE_REQUEST, fetchKeystoneSaga);
    yield takeLatest(TYPES.UPLOAD_KEYSTONE_REQUEST, uploadKeystoneSaga);
    yield takeLatest(TYPES.DELETE_KEYSTONE_REQUEST, deleteKeystoneSaga);
    yield takeLatest(TYPES.VIEW_KEYSTONE_REQUEST, viewKeystoneSaga);
}