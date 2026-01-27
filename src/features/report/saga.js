import { call, put, select, takeLatest } from "redux-saga/effects";
import api from "../../services/apiHelper";
import { uploadFilesSuccess, uploadFilesFailure } from "./uploadSlice";

function* uploadFilesWorker() {
  try {
    const { files, projectName } = yield select((s) => s.upload);

    let summary = "";
    let questions = [];
    let message = "";

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("project_name", projectName);
      formData.append("category", "UploadCenter");

      const response = yield call(
        api.post,
        "/search-related-summary/",
        formData
      );

      const data = response.data;

      if (data?.detail?.status === "duplicate") {
        message += `"${files[i].name}" already exists. `;
        continue;
      }

      message += `"${files[i].name}" uploaded successfully! `;

      if (i === files.length - 1) {
        summary = data.summary || "";

        if (Array.isArray(data.total_questions)) {
          questions = data.total_questions;
        } else if (typeof data.total_questions === "object") {
          questions = Object.values(data.total_questions).filter(Boolean);
        } else if (Array.isArray(data.questions)) {
          questions = data.questions;
        }
      }
    }

    yield put(uploadFilesSuccess({ summary, questions, message }));
  } catch (error) {
    yield put(
      uploadFilesFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

export default function* uploadSaga() {
  yield takeLatest("upload/uploadFilesRequest", uploadFilesWorker);
}
