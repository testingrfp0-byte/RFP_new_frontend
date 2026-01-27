import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";
import { Loader2 } from "lucide-react";

import {
    FETCH_TRASH_REQUEST,
    RESTORE_FILE_REQUEST,
    PERMANENT_DELETE_REQUEST,
} from "../../features/restore/recycleBinTypes";

import {
    selectRecycleBinList,
    selectRecycleBinLoading,
    selectRecycleBinActionLoading,
    selectRecycleBinError,
} from "../../features/restore/recycleBinSelectors";

export const RecycleBin = () => {
    const dispatch = useDispatch();
    const { isDarkMode } = useTheme();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const trashData = useSelector(selectRecycleBinList);
    const loading = useSelector(selectRecycleBinLoading);
    const actionLoading = useSelector(selectRecycleBinActionLoading);
    const error = useSelector(selectRecycleBinError);

    useEffect(() => {
        dispatch({ type: FETCH_TRASH_REQUEST });
    }, [dispatch]);

    const handleRestore = (rfp_id) => {
        dispatch({ type: RESTORE_FILE_REQUEST, payload: rfp_id });
    };

    const openConfirmDialog = (file) => {
        setFileToDelete(file);
        setShowConfirmDialog(true);
    };

    const closeConfirmDialog = () => {
        setShowConfirmDialog(false);
        setFileToDelete(null);
    };

    const confirmPermanentDelete = () => {
        if (!fileToDelete) return;

        dispatch({
            type: PERMANENT_DELETE_REQUEST,
            payload: fileToDelete.id,
        });

        closeConfirmDialog();
    };

    return (
        <div className={`p-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <h1
                        className={`text-3xl font-bold flex gap-3 ${isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                    >
                        <span className="text-4xl">♻️</span>
                        Restore
                    </h1>

                    <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                        View, restore, or permanently delete removed documents
                    </p>
                </div>

                {/* Content Card */}
                <div
                    className={`p-6 rounded-xl shadow-xl mb-6 border ${isDarkMode
                        ? "bg-gray-800 border-gray-600"
                        : "bg-white border-gray-200"
                        }`}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                        <h2
                            className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                        >
                            Deleted Documents
                        </h2>
                    </div>

                    {/* CONTENT */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                            <span
                                className={`ml-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"
                                    }`}
                            >
                                Loading deleted documents...
                            </span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-500 font-medium">{error}</p>
                        </div>
                    ) : trashData.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {trashData.map((file) => (
                                <div
                                    key={file.id}
                                    className={`rounded-lg p-4 transition-all hover:border-purple-500 hover:shadow-lg group ${isDarkMode
                                        ? "bg-gray-700 border border-gray-600"
                                        : "bg-gray-50 border border-gray-200"
                                        }`}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-500/30 transition">
                                            <span className="text-purple-400 text-xl">🗑️</span>
                                        </div>

                                        <h3
                                            className={`font-semibold mb-2 truncate w-full text-sm ${isDarkMode ? "text-white" : "text-gray-900"
                                                }`}
                                            title={file.filename || file.file_name}
                                        >
                                            {file.filename || file.file_name}
                                        </h3>

                                        <p
                                            className={`text-xs mb-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                                }`}
                                        >
                                            Deleted on:{" "}
                                            {file.deleted_at
                                                ? new Date(file.deleted_at).toLocaleDateString()
                                                : "—"}
                                        </p>

                                        <div className="flex justify-center gap-2 w-full mt-2">
                                            <button
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2"
                                                onClick={() => handleRestore(file.id)}
                                                disabled={actionLoading?.id === file.id}
                                            >
                                                {actionLoading?.id === file.id && actionLoading?.type === 'RESTORE' ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={14} />
                                                        <span>Restoring...</span>
                                                    </>
                                                ) : (
                                                    "Restore"
                                                )}
                                            </button>

                                            <button
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2"
                                                onClick={() => openConfirmDialog(file)}
                                                disabled={actionLoading?.id === file.id}
                                            >
                                                {actionLoading?.id === file.id && actionLoading?.type === 'DELETE' ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={14} />
                                                        <span>Deleting...</span>
                                                    </>
                                                ) : (
                                                    "Delete Permanently"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                                    }`}
                            >
                                <span
                                    className={`text-2xl ${isDarkMode ? "text-gray-500" : "text-gray-400"
                                        }`}
                                >
                                    🗑️
                                </span>
                            </div>

                            <p
                                className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"
                                    }`}
                            >
                                Recycle Bin is empty
                            </p>

                            <p className="text-sm mt-1 text-gray-500">
                                Deleted documents will appear here
                            </p>
                        </div>
                    )}
                </div>

                <ConfirmationDialog
                    isOpen={showConfirmDialog}
                    onClose={closeConfirmDialog}
                    onConfirm={confirmPermanentDelete}
                    title="Confirm Permanent Deletion"
                    message={`Are you sure you want to permanently delete "${fileToDelete?.filename}"? This action cannot be undone.`}
                />
            </div>
        </div>
    );
};
