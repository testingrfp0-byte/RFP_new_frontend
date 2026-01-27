import * as TYPES from "./rfpReportTypes";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

export default function rfpReportReducer(state = initialState, action) {
  switch (action.type) {
    case TYPES.FETCH_RFP_DOCS_REQUEST:
      return { ...state, loading: true };

    case TYPES.FETCH_RFP_DOCS_SUCCESS:
      return { ...state, loading: false, list: action.payload };

    case TYPES.DELETE_RFP_DOC_SUCCESS:
      return {
        ...state,
        list: state.list.filter((doc) => doc.id !== action.payload),
      };

    case TYPES.FETCH_RFP_DOCS_FAILURE:
    case TYPES.DELETE_RFP_DOC_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
