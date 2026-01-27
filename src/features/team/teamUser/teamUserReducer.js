import * as TYPES from "./teamUserTypes";

const initialState = {
  list: [],
  loading: false,
  actionLoading: null,
  error: null,
  successMessage: null,
};

export default function teamUsersReducer(state = initialState, action) {
  switch (action.type) {
    case TYPES.FETCH_TEAM_USERS_REQUEST:
      return { ...state, loading: true, error: null };

    case TYPES.FETCH_TEAM_USERS_SUCCESS:
      return { ...state, loading: false, list: action.payload };

    case TYPES.FETCH_TEAM_USERS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case TYPES.ADD_TEAM_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case TYPES.ADD_TEAM_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        successMessage: action.payload,
      };

    case TYPES.ADD_TEAM_USER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case TYPES.DELETE_TEAM_USER_REQUEST:
      return { ...state, actionLoading: action.payload };

    case TYPES.DELETE_TEAM_USER_SUCCESS:
      return { ...state, actionLoading: null };

    case TYPES.DELETE_TEAM_USER_FAILURE:
      return { ...state, actionLoading: null, error: action.payload };

    case TYPES.CLEAR_TEAM_USER_SUCCESS:
      return {
        ...state,
        successMessage: null,
      };

    case TYPES.RESET_TEAM_USERS_STATE:
      return initialState;

    default:
      return state;
  }
}
