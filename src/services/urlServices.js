const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AUTH_URLS = {
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  VERIFY_OTP: `${API_BASE_URL}/verify_otp`,
  FORGOT_PASSWORD: `${API_BASE_URL}/forgot_password`,
  RESET_PASSWORD: `${API_BASE_URL}/reset_password`,
  CHANGE_PASSWORD: `${API_BASE_URL}/change-password`,
  REGISTER_VERIFICATION: `${API_BASE_URL}/update-password`,
  SIMPLE_EMAIL_VERIFY: `${API_BASE_URL}/verify-email`,
};

export const PROFILE_URLS = {
  USER_DETAILS: (userId) => `${API_BASE_URL}/userdetails/${userId}`,
  UPDATE_PROFILE: `${API_BASE_URL}/update-profile`,
};

export const DOCUMENT_URLS = {
  LIST: `${API_BASE_URL}/filedetails`,
  DETAILS: (id) => `${API_BASE_URL}/rfpdetails/${id}`,
  DELETE: (id) => `${API_BASE_URL}/rfp/${id}`,
  FILTER_DATA: (id) => `${API_BASE_URL}/filter/${id}`,
  AI_ANALYSIS: (id) => `${API_BASE_URL}/admin/analyze-answers?rfp_id=${id}`,
  GENERATE: (id) => `${API_BASE_URL}/generate-rfp-doc/?rfp_id=${id}`,
  ADD_QUESTION: (id) => `${API_BASE_URL}/add/questions/${id}`,
};

export const QUESTION_URLS = {
  ASSIGNED: `${API_BASE_URL}/assigned-questions`,
  SUBMITTED: `${API_BASE_URL}/check_submit`,
  FILTER: `${API_BASE_URL}/filter-questions-by-user`,
  DELETE: (id) => `${API_BASE_URL}/delete/questions/${id}`,
  CHECK_SUBMIT: `${API_BASE_URL}/check_submit`,
  ADD: (id) => `${API_BASE_URL}/add/questions/${id}`,
  ANALYZE: `${API_BASE_URL}/analyze-question`,
  REASSIGN: `${API_BASE_URL}/reassign`,
  ADMIN_UPDATE: `${API_BASE_URL}/admin/edit-answer`,
  TOTAL_QUESTION: (rfpId) =>
    `${API_BASE_URL}/rfpdetails/${rfpId}/total question`,
};

export const QUESTION_STATUSES = {
  SUBMITTED: "submitted",
  NOT_SUBMITTED: "not submitted",
  PROCESS: "process",
};

export const ANSWER_URLS = {
  GENERATE: (id) => `${API_BASE_URL}/generate-answers/${id}`,
  UPDATE: (id) => `${API_BASE_URL}/update-answer/${id}`,
  SUBMIT: `${API_BASE_URL}/submit`,
  VERSIONS: (id) => `${API_BASE_URL}/answers/${id}/versions`,
  ANALYZE: `${API_BASE_URL}/analyze-question`,
  CHAT_PROMPT: `${API_BASE_URL}/questions/chat_input`,
  ADMIN_EDIT: `${API_BASE_URL}/admin/edit-answer`,
};

export const USER_URLS = {
  LIST: `${API_BASE_URL}/userdetails`,
};

export const TEAM_USER_URLS = {
  LIST: `${API_BASE_URL}/userdetails`,
  ADD: `${API_BASE_URL}/register`,
  DELETE: `${API_BASE_URL}/delete-reviewer_user`,
};

export const ASSIGNMENT_URLS = {
  ASSIGN: `${API_BASE_URL}/assign-reviewer`,
  UNASSIGN: `${API_BASE_URL}/reviewer-remove`,
  ASSIGNED_REVIEWERS: (rfpId) => `${API_BASE_URL}/assigned-reviewers/${rfpId}`,
  REASSIGN: `${API_BASE_URL}/reassign`,
  SEND_NOTIFICATION: `${API_BASE_URL}/send-assignment-notification`,
};

export const UPLOAD_URLS = {
  ANALYZE: `${API_BASE_URL}/search-related-summary/`,
  FILE_LIST: `${API_BASE_URL}/filedetails`,
};

export const RECYCLE_BIN_URLS = {
  LIST: `${API_BASE_URL}/rfp/trash`,
  RESTORE: (rfpId) => `${API_BASE_URL}/rfp/${rfpId}/restore`,
  PERMANENT_DELETE: (rfpId) => `${API_BASE_URL}/rfp/${rfpId}/permanent`,
};

export const LIBRARY_URLS = {
  LIST: `${API_BASE_URL}/filedetails`,
  DELETE: (rfpId) => `${API_BASE_URL}/rfp/${rfpId}`,
  VIEW: (rfpId) => `${API_BASE_URL}/rfp-documents/${rfpId}/view`,
  ANALYZE: `${API_BASE_URL}/search-related-summary/`,
  UPLOAD: `${API_BASE_URL}/upload-library`,
};

export const RFP_REPORT_URLS = {
  LIST: `${API_BASE_URL}/list-rfp-docs/`,
  // DOWNLOAD: (docId) =>
  //   `${API_BASE_URL}/documents/${docId}/download`,
  DELETE: (docId) => `${API_BASE_URL}/delete-gen-doc/${docId}`,
};
;

export const REVIEWER_ASSIGNED_URLS = {
  STATUS: `${API_BASE_URL}/assign_user_status`,
  USERS: `${API_BASE_URL}/userdetails`,
  FILES: `${API_BASE_URL}/filedetails`,
  RFP_DETAILS: (id) => `${API_BASE_URL}/rfpdetails/${id}`,
  REMOVE: `${API_BASE_URL}/reviewer-remove`,
};

export const KEYSTONE_URLS = {
  LIST: `${API_BASE_URL}/keystone/files`,
  UPLOAD: `${API_BASE_URL}/keystone/upload`,
  DELETE: (id) => `${API_BASE_URL}/keystone/delete/${id}`,
  VIEW: (id) => `${API_BASE_URL}/keystone/files/${id}/view`,
};