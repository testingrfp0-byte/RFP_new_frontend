import * as TYPES from "./reviewerAssignedTypes";

const initialState = {
  reviewers: [],
  assignedQuestions: [],
  documentQuestions: [],
  selectedReviewer: null,

  loading: false,
  removingQuestion: null,

  userRole: null,
  error: null,
};

export default function reviewerAssignedReducer(state = initialState, action) {
  switch (action.type) {
    case TYPES.CHECK_USER_ROLE_SUCCESS:
      return { ...state, userRole: action.payload };

    case TYPES.FETCH_REVIEWERS_REQUEST:
    case TYPES.FETCH_REVIEWER_QUESTIONS_REQUEST:
    case TYPES.FETCH_DOCUMENT_QUESTIONS_REQUEST:
      return { ...state, loading: true, error: null };

    case TYPES.FETCH_REVIEWERS_SUCCESS:
      return { ...state, loading: false, reviewers: action.payload };

    case TYPES.FETCH_REVIEWER_QUESTIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        assignedQuestions: action.payload.questions,
        selectedReviewer: action.payload.reviewer,
      };

    case TYPES.FETCH_DOCUMENT_QUESTIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        documentQuestions: action.payload,
      };

    case TYPES.REMOVE_REVIEWER_QUESTION_REQUEST:
      return {
        ...state,
        removingQuestion: action.payload.ques_id,
      };

    case TYPES.REMOVE_REVIEWER_QUESTION_SUCCESS:
      const removeId = action.payload;
      return {
        ...state,
        removingQuestion: null,
        assignedQuestions: state.assignedQuestions.filter(
          (q) =>
            (q.ques_id || q.question_id || q.id) !== removeId
        ),
        documentQuestions: state.documentQuestions.filter(
          (q) =>
            (q.ques_id || q.question_id || q.id) !== removeId
        ),
      };

    case TYPES.REMOVE_REVIEWER_QUESTION_FAILURE:
      return {
        ...state,
        removingQuestion: null,
        error: action.payload,
      };


    case TYPES.CHECK_USER_ROLE_FAILURE:
    case TYPES.FETCH_REVIEWERS_FAILURE:
    case TYPES.FETCH_REVIEWER_QUESTIONS_FAILURE:
    case TYPES.FETCH_DOCUMENT_QUESTIONS_FAILURE:
    case TYPES.REMOVE_REVIEWER_QUESTION_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
