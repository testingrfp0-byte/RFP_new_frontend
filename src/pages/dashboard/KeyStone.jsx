import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiLoader } from "react-icons/fi";
import { motion } from "framer-motion";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";
import * as TYPES from "../../features/keystone/keystoneTypes";

export default function KeystoneManager({ isDarkMode }) {
  const dispatch = useDispatch();
  const { list: documents, loading } = useSelector((state) => state.keystone);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    fileId: null,
    fileName: "",
  });

  useEffect(() => {
    dispatch({ type: TYPES.FETCH_KEYSTONE_REQUEST });
  }, [dispatch]);

  const processFile = async (file) => {
    if (!file) return;

    setSelectedFile(file);
    setUploadProgress(0);
    setIsUploading(true);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 200);

    dispatch({
      type: TYPES.UPLOAD_KEYSTONE_REQUEST,
      payload: { file },
    });

    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
        setSelectedFile(null);
      }, 500);
    }, 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    processFile(file);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleViewFile = (file) => {
    dispatch({
      type: TYPES.VIEW_KEYSTONE_REQUEST,
      payload: file.id,
    });
  };

  const openDeleteDialog = (fileId, fileName) => {
    setDeleteDialog({
      isOpen: true,
      fileId,
      fileName,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      fileId: null,
      fileName: "",
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.fileId) {
      dispatch({
        type: TYPES.DELETE_KEYSTONE_REQUEST,
        payload: deleteDialog.fileId,
      });
    }
    closeDeleteDialog();
  };

  const renderDocumentCard = (file) => (
    <div
      key={file.id}
      className={`rounded-lg p-3 transition-all hover:shadow-lg flex items-center justify-between cursor-pointer
      ${isDarkMode
          ? "bg-gray-700 border border-gray-600 hover:bg-gray-650"
          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
        }`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-purple-400 text-lg">📄</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm mb-1 leading-tight break-words
            ${isDarkMode ? "text-white" : "text-gray-900"}`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            title={file.filename}
          >
            {file.filename}
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
              {file.type || "PDF"}
            </span>

            {file.size && (
              <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                {file.size}
              </span>
            )}

            <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
              {new Date(
                file.uploaded_at || file.uploadedAt
              ).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          onClick={() => handleViewFile(file)}
        >
          View
        </button>

        <button
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            openDeleteDialog(file.id, file.filename);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto min-h-screen">
      <ToastContainer />

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-8 rounded-full ${isDarkMode ? "bg-purple-500" : "bg-purple-600"
                }`}
            ></div>
            <h2
              className={`text-xl font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                }`}
            >
              Keystone Fields Management
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".xlsx"
            className="hidden"
            id="fileInput"
            onChange={handleFileUpload}
            disabled={isUploading}
          />

          <label
            htmlFor="fileInput"
            className={`flex-1 cursor-pointer ${isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${isDarkMode ? "border-gray-700" : "border-gray-300"
                }`}
            >
              {isUploading ? (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <FiLoader className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    Processing document...
                  </p>
                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <motion.div
                        className="bg-purple-600 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-400 text-2xl">📤</span>
                  </div>
                  <h3
                    className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                  >
                    Upload Keystone Document
                  </h3>
                  <p className="text-sm mb-1 text-gray-500">
                    Only .xlsx files are allowed
                  </p>
                  <p className="text-sm mb-4 text-gray-500 mt-1">
                    {selectedFile
                      ? selectedFile.name
                      : "Drag and drop files here or click to browse"}
                  </p>
                  <label
                    htmlFor="fileInput"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer inline-block"
                  >
                    Choose Files
                  </label>
                </>
              )}
            </div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <p
                className={`mt-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
              >
                Loading documents...
              </p>
            </div>
          ) : documents.length > 0 ? (
            documents.map((doc) => renderDocumentCard(doc))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                No documents uploaded yet
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete File"
        message={`Are you sure you want to delete "${deleteDialog.fileName}"? This action cannot be undone.`}
      />
    </div>
  );
}