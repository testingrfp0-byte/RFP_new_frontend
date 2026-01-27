export const selectRecycleBinList = (state) => state.recycleBin.list;
export const selectRecycleBinLoading = (state) => state.recycleBin.loading;
export const selectRecycleBinActionLoading = (state) =>
  state.recycleBin.actionLoading;
export const selectRecycleBinError = (state) => state.recycleBin.error;
