import { call, put, takeLatest } from "redux-saga/effects";
import api from "../../services/apiHelper";
import * as TYPES from "./recycleBinTypes";
import { RECYCLE_BIN_URLS } from "../../services/urlServices";
import { toast } from "react-toastify";

function* fetchTrashSaga() {
    try {
        const res = yield call(api.get, RECYCLE_BIN_URLS.LIST);

        const trashList =
            Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.data)
                    ? res.data.data
                    : [];

        yield put({
            type: TYPES.FETCH_TRASH_SUCCESS,
            payload: trashList,
        });
    } catch (e) {
        yield put({
            type: TYPES.FETCH_TRASH_FAILURE,
            payload: e.response?.data?.detail || e.message,
        });
        toast.error("Failed to fetch recycle bin data");
    }
}

function* restoreFileSaga(action) {
    try {
        yield call(api.post, RECYCLE_BIN_URLS.RESTORE(action.payload));
        yield put({ type: TYPES.RESTORE_FILE_SUCCESS });
        toast.success("File restored successfully");
        yield put({ type: TYPES.FETCH_TRASH_REQUEST });
    } catch (e) {
        yield put({
            type: TYPES.RESTORE_FILE_FAILURE,
            payload: e.response?.data?.detail || e.message,
        });
        toast.error("Restore Failed");
    }
}

function* permanentDeleteSaga(action) {
    try {
        yield call(api.delete, RECYCLE_BIN_URLS.PERMANENT_DELETE(action.payload));
        yield put({ type: TYPES.PERMANENT_DELETE_SUCCESS });
        toast.success("File deleted permanently");
        yield put({ type: TYPES.FETCH_TRASH_REQUEST });
    } catch (e) {
        yield put({
            type: TYPES.PERMANENT_DELETE_FAILURE,
            payload: e.response?.data?.detail || e.message,
        });
        toast.error("Delete Failed");
    }
}

export default function* recycleBinSaga() {
    yield takeLatest(TYPES.FETCH_TRASH_REQUEST, fetchTrashSaga);
    yield takeLatest(TYPES.RESTORE_FILE_REQUEST, restoreFileSaga);
    yield takeLatest(TYPES.PERMANENT_DELETE_REQUEST, permanentDeleteSaga);
}
