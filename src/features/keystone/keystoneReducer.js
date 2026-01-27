import * as TYPES from "./keystoneTypes";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

export default function keystoneReducer(state = initialState, action) {
  switch (action.type) {
    case TYPES.FETCH_KEYSTONE_REQUEST:
    case TYPES.UPLOAD_KEYSTONE_REQUEST:
    case TYPES.DELETE_KEYSTONE_REQUEST:
      return { ...state, loading: true, error: null };

    case TYPES.FETCH_KEYSTONE_SUCCESS:
      return { ...state, loading: false, list: action.payload };

    case TYPES.UPLOAD_KEYSTONE_SUCCESS:
    case TYPES.DELETE_KEYSTONE_SUCCESS:
      return { ...state, loading: false };

    case TYPES.FETCH_KEYSTONE_FAILURE:
    case TYPES.UPLOAD_KEYSTONE_FAILURE:
    case TYPES.DELETE_KEYSTONE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
