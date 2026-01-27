export const selectTeamUsers = (state) => state.teamUsers.list;
export const selectTeamUsersLoading = (state) => state.teamUsers.loading;
export const selectTeamUsersActionLoading = (state) =>
  state.teamUsers.actionLoading;
export const selectTeamUsersError = (state) => state.teamUsers.error;
export const selectTeamUsersSuccess = (state) =>
  state.teamUsers.successMessage;
