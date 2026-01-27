import * as TYPES from "./recycleBinTypes";

const initialState = {
  list: [],
  loading: false,
  actionLoading: null,
  error: null,
};

export default function recycleBinReducer(state = initialState, action) {
  switch (action.type) {
    case TYPES.FETCH_TRASH_REQUEST:
      return { ...state, loading: true, error: null };

    case TYPES.FETCH_TRASH_SUCCESS:
      return { ...state, loading: false, list: action.payload };

    case TYPES.FETCH_TRASH_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case TYPES.RESTORE_FILE_REQUEST:
      return { ...state, actionLoading: { id: action.payload, type: 'RESTORE' } };
    case TYPES.PERMANENT_DELETE_REQUEST:
      return { ...state, actionLoading: { id: action.payload, type: 'DELETE' } };

    case TYPES.RESTORE_FILE_SUCCESS:
    case TYPES.PERMANENT_DELETE_SUCCESS:
      return { ...state, actionLoading: null };

    case TYPES.RESTORE_FILE_FAILURE:
    case TYPES.PERMANENT_DELETE_FAILURE:
      return { ...state, actionLoading: null, error: action.payload };

    default:
      return state;
  }
}
