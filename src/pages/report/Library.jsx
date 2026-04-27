import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";
import { toast } from "react-toastify";
import KeyStoneManager from "../dashboard/KeyStone";
import { useDispatch, useSelector } from "react-redux";
import {
  FETCH_LIBRARY_REQUEST,
  DELETE_LIBRARY_REQUEST,
  VIEW_LIBRARY_REQUEST,
  UPLOAD_LIBRARY_REQUEST,
} from "../../features/library/libraryType";

import {
  selectHistoricRFPs,
  selectCleanFiles,
  selectTrainingMaterials,
  selectLearningDocuments,
  selectLibraryLoading,
  selectBackgroundMaterials,
} from "../../features/library/librarySelectors";

export default function Library() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("upload");
  const [keystoneCount, setKeystoneCount] = useState(0);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showProjectNameError, setShowProjectNameError] = useState(false);
  const [useExistingProject, setUseExistingProject] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [userRole, setUserRole] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [showProviderError, setShowProviderError] = useState(false);
  const calledOnceRef = useRef(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [rfpToDelete, setRfpToDelete] = useState(null);
  const trainingFileInputRef = useRef(null);
  const learningFileInputRef = useRef(null);
  const historicFileInputRef = useRef(null);
  const cleanFileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState({});

  const dispatch = useDispatch();

  const historicRFPs = useSelector(selectHistoricRFPs);
  const clean = useSelector(selectCleanFiles);
  const trainingMaterials = useSelector(selectTrainingMaterials);
  const learningDocuments = useSelector(selectLearningDocuments);
  const backgroundMaterials = useSelector(selectBackgroundMaterials);
  const loading = useSelector(selectLibraryLoading);

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      try {
        const parsedSession = JSON.parse(session);
        setUserRole(parsedSession.role || "admin");
      } catch (error) {
        console.error("Error parsing session:", error);
        setUserRole("admin");
      }
    }
  }, []);

  useEffect(() => {
    if (!calledOnceRef.current) {
      dispatch({ type: FETCH_LIBRARY_REQUEST });
      calledOnceRef.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    const allDocuments = [
      ...historicRFPs,
      ...clean,
      ...trainingMaterials,
      ...learningDocuments,
    ];

    const projects = [
      ...new Set(
        allDocuments
          .filter((doc) => doc.project_name && doc.project_name.trim() !== "")
          .map((doc) => doc.project_name),
      ),
    ].sort();

    setAvailableProjects(projects);
  }, [historicRFPs, clean, trainingMaterials, learningDocuments]);

  const handleViewRFP = (rfpId) => {
    dispatch({
      type: VIEW_LIBRARY_REQUEST,
      payload: rfpId,
    });
  };

  const handleDeletePdf = useCallback(
    async (rfpId) => {
      setIsConfirmOpen(true);
      setRfpToDelete(rfpId);
    },
    [setRfpToDelete],
  );

  const confirmDelete = useCallback(() => {
    setIsConfirmOpen(false);
    if (rfpToDelete) {
      dispatch({
        type: DELETE_LIBRARY_REQUEST,
        payload: rfpToDelete,
      });
    }
    setRfpToDelete(null);
  }, [rfpToDelete, dispatch]);

  const cancelDelete = useCallback(() => {
    setIsConfirmOpen(false);
    setRfpToDelete(null);
  }, []);

  const handleDragOver = (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver((prev) => ({ ...prev, [category]: true }));
  };

  const handleDragEnter = (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver((prev) => ({ ...prev, [category]: true }));
  };

  const handleDragLeave = (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOver((prev) => ({ ...prev, [category]: false }));
  };

  const handleDrop = (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver((prev) => ({ ...prev, [category]: false }));

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files, category);
    }
  };

  const getProjectNameForUpload = () => {
    if (useExistingProject && selectedProject) {
      return selectedProject;
    } else if (newProjectName.trim()) {
      return newProjectName.trim();
    }
    return "";
  };

  const handleFiles = (files, category) => {
    if (!files || files.length === 0) return;

    const projectName = getProjectNameForUpload();
    if (!projectName) {
      setShowProjectNameError(true);
      return;
    }

    if (!selectedProvider) {
      setShowProviderError(true);
      toast.error("AI Provider is required");
      return;
    }

    setShowProjectNameError(false);
    setShowProviderError(false);

    const newUploadingFiles = Array.from(files).map((file) => ({
      name: file.name,
      category,
      progress: 0,
      fileKey: `${file.name}_${Date.now()}_${Math.random()}`,
    }));
    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileKey = newUploadingFiles[i].fileKey;
      uploadSingleFile(file, category, projectName, fileKey);
    }
  };

  const handleFileUpload = (event, category) => {
    event.preventDefault();

    const projectName = getProjectNameForUpload();
    if (!projectName) {
      setShowProjectNameError(true);
      event.target.value = "";
      return;
    }

    if (!selectedProvider) {
      setShowProviderError(true);
      toast.error("AI Provider is required");
      event.target.value = "";
      return;
    }

    setShowProjectNameError(false);
    setShowProviderError(false);

    const files = event.target.files;
    if (files && files.length > 0) {
      handleFiles(files, category);
    }

    event.target.value = "";
  };

  const uploadSingleFile = (file, category, projectName, fileKey) => {
    setUploadProgress((prev) => ({ ...prev, [fileKey]: 0 }));

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const current = prev[fileKey] || 0;
        if (current < 90) {
          return { ...prev, [fileKey]: current + 5 };
        } else if (current < 99) {
          return { ...prev, [fileKey]: current + 0.5 };
        }
        return prev;
      });
    }, 200);

    const cleanup = () => {
      clearInterval(progressInterval);
      setUploadProgress((prev) => {
        const copy = { ...prev };
        delete copy[fileKey];
        return copy;
      });
      setUploadingFiles((prev) => prev.filter((f) => f.fileKey !== fileKey));
    };

    dispatch({
      type: UPLOAD_LIBRARY_REQUEST,
      payload: {
        file,
        category,
        projectName,
        provider: selectedProvider,
        customMessage: customPrompt,
        onSuccess: () => {
          setNewProjectName("");
          setCustomPrompt("");
          cleanup();
        },
        onError: () => {
          cleanup();
        },
      },
    });
  };

  const groupFilesByProject = (files) => {
    return files.reduce((acc, file) => {
      const projectName = file.project_name || "Uncategorized";
      if (!acc[projectName]) {
        acc[projectName] = [];
      }
      acc[projectName].push(file);
      return acc;
    }, {});
  };

  const groupedCleanFiles = groupFilesByProject(clean);
  const groupedTrainingFiles = groupFilesByProject(trainingMaterials);
  const sortedCleanProjects = Object.keys(groupedCleanFiles).sort();
  const sortedTrainingProjects = Object.keys(groupedTrainingFiles).sort();
  const groupedBackgroundMaterials = groupFilesByProject(backgroundMaterials);
  const sortedBackgroundProjects = Object.keys(
    groupedBackgroundMaterials,
  ).sort();

  const tabs = [
    {
      id: "upload",
      label: "Upload a new RFP",
      icon: "📤",
      count: historicRFPs.length,
    },
    {
      id: "historic",
      label: "Historic RFPs",
      icon: "📋",
      count: clean.length,
    },
    {
      id: "training",
      label: "Training Materials",
      icon: "📖",
      count: trainingMaterials.length,
    },
    {
      id: "keystone",
      label: "Keystone Data",
      icon: "🔑",
      count: keystoneCount,
    },
    {
      id: "Client and Industry Background",
      label: "Client and Industry Background",
      icon: "🗂️",
      count: learningDocuments.length,
    },
  ];

  const renderDocumentCard = (doc, showActions = true) => (
    <div
      key={doc.id}
      className={`rounded-lg p-3 transition-all hover:shadow-lg flex flex-col justify-between cursor-pointer
        ${isDarkMode
          ? "bg-gray-700 border border-gray-600 hover:bg-gray-650"
          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
        }`}
    >
      <div className="flex items-start justify-between gap-2 flex-wrap">
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
              title={doc.filename || doc.name}
            >
              {doc.filename || doc.name}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span
                className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {doc.type || "PDF"}
              </span>
              {doc.size && (
                <span
                  className={`${isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  {doc.size}
                </span>
              )}
              <span
                className={`${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {new Date(
                  doc.uploaded_at || doc.uploadedAt,
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        {showActions && (
          <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              onClick={() => handleViewRFP(doc.document_id || doc.id)}
            >
              View
            </button>
            {userRole !== "reviewer" && (
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePdf(doc.document_id || doc.id);
                }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderGroupedFiles = (groupedFiles, sortedProjects, emptyMessage) => {
    if (sortedProjects.length === 0) {
      return (
        <div className="text-center py-12">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
          >
            <span
              className={`text-2xl transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
            >
              📋
            </span>
          </div>
          <p
            className={`text-lg transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
          >
            {emptyMessage}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {sortedProjects.map((projectName) => {
          const projectFiles = groupedFiles[projectName];
          return (
            <div key={projectName} className="space-y-4">
              <div
                className={`px-4 py-3 rounded-lg border-l-4 border-purple-500 ${isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
                  }`}
              >
                <h3
                  className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                >
                  {projectName}
                </h3>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  {projectFiles.length} document
                  {projectFiles.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectFiles.map((file) => renderDocumentCard(file))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderUploadSection = (category, title) => {
    if (userRole === "reviewer") return null;

    const isDisabled =
      uploadingFiles.some(
        (file) =>
          file.category === category && uploadProgress[file.fileKey] > 0,
      ) || loading;

    const isDragActive = dragOver[category] || false;

    return (
      <>
        <div className="space-y-4 mb-6">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
            >
              Project Name
            </label>
            <input
              type="text"
              placeholder="Enter project name"
              value={newProjectName}
              onChange={(e) => {
                setNewProjectName(e.target.value);
                if (e.target.value.trim()) setShowProjectNameError(false);
              }}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${showProjectNameError && !newProjectName.trim()
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-purple-500"
                } ${isDarkMode ? "bg-gray-700 text-white" : "bg-white"} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>

          {showProjectNameError && (
            <p className="text-red-500 text-sm">Project name is required</p>
          )}
        </div>

        <div
          onDragOver={(e) => !loading && handleDragOver(e, category)}
          onDragEnter={(e) => !loading && handleDragEnter(e, category)}
          onDragLeave={(e) => !loading && handleDragLeave(e, category)}
          onDrop={(e) => !loading && handleDrop(e, category)}
          className={`rounded-lg p-4 mb-5 border-2 border-dashed transition-colors ${isDragActive
            ? "border-purple-500 bg-purple-500/10"
            : isDarkMode
              ? "border-gray-600 bg-gray-800/50"
              : "border-gray-300 bg-gray-50/50"
            } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-400 text-2xl">📤</span>
            </div>
            <h3
              className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"
                }`}
            >
              Upload {title}
            </h3>
            <p
              className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
            >
              {isDragActive
                ? "Drop files here"
                : "Drag and drop files here or click to browse"}
            </p>
            <input
              type="file"
              id={`upload-${category}`}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.ppt,.pptx"
              onChange={(e) => handleFileUpload(e, category)}
              disabled={isDisabled}
              multiple
              ref={
                category === "clean"
                  ? cleanFileInputRef
                  : category === "training"
                    ? trainingFileInputRef
                    : category === "learning"
                      ? learningFileInputRef
                      : historicFileInputRef
              }
            />
            <label
              htmlFor={`upload-${category}`}
              className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer inline-block ${isDisabled ? "cursor-not-allowed opacity-75" : ""
                }`}
            >
              {loading ? "Choose Files" : "Choose Files"}
            </label>
          </div>
        </div>
      </>
    );
  };

  return (
    <div
      className={`p-4 transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 flex items-center gap-3 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
              }`}
          >
            <span className="text-4xl">📚</span>
            Upload Center and Library
          </h1>
          <p
            className={`transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
          >
            Access historic RFP responses, training materials, and learning
            documents
          </p>
        </div>

        {uploadingFiles.length > 0 && (
          <div
            className={`mb-6 p-4 rounded-lg transition-colors ${isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
              }`}
          >
            <h3
              className={`font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-900"
                }`}
            >
              Uploading Files
            </h3>

            {uploadingFiles.map((file) => (
              <div key={file.fileKey} className="mb-3 last:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                  <span
                    className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                  >
                    {file.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {uploadProgress[file.fileKey] || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress[file.fileKey] || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6">
          <div
            className={`flex space-x-1 p-1 rounded-lg ${isDarkMode
              ? "bg-gray-200 dark:bg-gray-700 border border-gray-700"
              : "bg-white border border-gray-200"
              }`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                  ? "bg-gray-800 dark:bg-white dark:text-gray-800 text-white shadow-sm"
                  : isDarkMode
                    ? "text-gray-800 hover:text-white hover:bg-gray-800"
                    : "text-gray-800 hover:text-white hover:bg-gray-800"
                  }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id
                      ? "bg-purple-100 text-purple-600"
                      : isDarkMode
                        ? "bg-gray-600 text-gray-300"
                        : "bg-gray-300 text-gray-600"
                      }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`rounded-xl shadow-xl p-6 transition-colors ${isDarkMode
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
            }`}
        >
          <>
            {deleteMessage && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${deleteMessage.includes("Error")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
                  } ${isDarkMode
                    ? "border border-gray-600"
                    : "border border-gray-200"
                  }`}
              >
                {deleteMessage}
              </div>
            )}
            <ConfirmationDialog
              isOpen={isConfirmOpen}
              onClose={cancelDelete}
              onConfirm={confirmDelete}
              title="Confirm Deletion"
              message="Are you sure you want to delete this document? This action cannot be undone."
            />

            {activeTab === "upload" && (
              <div className="animate-in fade-in duration-500">
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <label
                        className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-white" : "text-purple-700"
                          }`}
                      >
                        AI Provider Configuration
                      </label>
                      <select
                        value={selectedProvider}
                        onChange={(e) => {
                          setSelectedProvider(e.target.value);
                          if (e.target.value) setShowProviderError(false);
                        }}
                        className={`w-full sm:w-64 px-4 py-2 rounded-lg border outline-none transition-all focus:ring-2 appearance-none cursor-pointer ${isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-650"
                          : "bg-white border-gray-300 text-gray-900 hover:border-purple-400"
                          } ${showProviderError
                            ? "border-red-500 focus:ring-red-500"
                            : "focus:ring-purple-500/50"
                          }`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDarkMode ? "%239ca3af" : "%234b5563"}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 1rem center",
                          backgroundSize: "1.25rem",
                          paddingRight: "2.5rem",
                        }}
                      >
                        <option value="">Select AI Provider</option>
                        <option value="gpt-4o-mini">gpt-4o-mini</option>
                        <option value="gpt-4o">gpt-4o</option>
                        <option value="gpt-5.4">gpt-5.4</option>
                        <option value="claude-sonnet-4-6">claude-sonnet-4-6</option>
                        <option value="claude-opus-4-6">claude-opus-4-6</option>
                        <option value="claude-haiku-4-5-20251001">
                          claude-haiku-4-5-20251001
                        </option>
                      </select>
                      {showProviderError && (
                        <p className="text-red-500 text-xs mt-1">
                          AI Provider is required
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                  <h2
                    className={`text-xl font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                  >
                    Upload New RFP Documents
                  </h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                    >
                      Project Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter project name"
                      value={newProjectName}
                      onChange={(e) => {
                        setNewProjectName(e.target.value);
                        if (e.target.value.trim())
                          setShowProjectNameError(false);
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${showProjectNameError && !newProjectName.trim()
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-purple-500"
                        } ${isDarkMode ? "bg-gray-700 text-white" : "bg-white"}`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                    >
                      Chat Prompt
                    </label>
                    <input
                      type="text"
                      placeholder="Enter chat prompt"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-purple-500 ${isDarkMode ? "bg-gray-700 text-white" : "bg-white"}`}
                    />
                  </div>

                  {showProjectNameError && (
                    <p className="text-red-500 text-sm">
                      Project name is required
                    </p>
                  )}
                </div>

                <div
                  onDragOver={(e) => handleDragOver(e, "upload_new")}
                  onDragEnter={(e) => handleDragEnter(e, "upload_new")}
                  onDragLeave={(e) => handleDragLeave(e, "upload_new")}
                  onDrop={(e) => handleDrop(e, "upload_new")}
                  className={`rounded-lg p-4 mb-5 border-2 border-dashed transition-colors ${dragOver["upload_new"]
                    ? "border-purple-500 bg-purple-500/10"
                    : isDarkMode
                      ? "border-gray-600 bg-gray-800/50"
                      : "border-gray-300 bg-gray-50/50"
                    } ${uploadingFiles.some(
                      (file) =>
                        file.category === "upload_new" &&
                        uploadProgress[file.fileKey] > 0,
                    )
                      ? "cursor-not-allowed opacity-50"
                      : ""
                    }`}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-purple-400 text-2xl">📤</span>
                    </div>
                    <h3
                      className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                    >
                      Upload RFP Documents
                    </h3>
                    <p
                      className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                      {dragOver["upload_new"]
                        ? "Drop files here"
                        : "Drag and drop PDF files here or click to browse"}
                    </p>
                    <input
                      type="file"
                      id="upload-center"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.ppt,.pptx"
                      onChange={(e) => handleFileUpload(e, "upload_new")}
                      disabled={uploadingFiles.some(
                        (file) =>
                          file.category === "upload_new" &&
                          uploadProgress[file.fileKey] > 0,
                      )}
                      multiple
                      ref={historicFileInputRef}
                    />
                    <label
                      htmlFor="upload-center"
                      className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer inline-block ${uploadingFiles.some(
                        (file) =>
                          file.category === "upload_new" &&
                          uploadProgress[file.fileKey] > 0,
                      )
                        ? "cursor-not-allowed"
                        : ""
                        }`}
                    >
                      Choose Files
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  {historicRFPs.length > 0 ? (
                    <div className="space-y-8">
                      {renderGroupedFiles(
                        groupFilesByProject(historicRFPs),
                        Object.keys(groupFilesByProject(historicRFPs)).sort(),
                        "No RFP documents available, please upload.",
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                          }`}
                      >
                        <span
                          className={`text-2xl transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                        >
                          📋
                        </span>
                      </div>
                      <p
                        className={`text-lg transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                      >
                        No RFP documents available, please upload.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "historic" && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                  <h2
                    className={`text-xl font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                  >
                    Historic RFP Responses
                  </h2>
                </div>
                {renderUploadSection("clean", "Historic Materials")}

                {renderGroupedFiles(
                  groupedCleanFiles,
                  sortedCleanProjects,
                  "No historic RFPs available",
                )}
              </div>
            )}

            {activeTab === "training" && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                  <h2
                    className={`text-xl font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                  >
                    Background Training Materials
                  </h2>
                </div>

                {renderUploadSection("training", "Training Materials")}

                {renderGroupedFiles(
                  groupedTrainingFiles,
                  sortedTrainingProjects,
                  "No training materials available",
                )}
              </div>
            )}

            {activeTab === "keystone" && (
              <KeyStoneManager
                isDarkMode={isDarkMode}
                userRole={userRole}
                onDataChange={setKeystoneCount}
              />
            )}

            {activeTab === "Client and Industry Background" && (
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-purple-600 rounded-full"></div>
                    <h2
                      className={`text-xl font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                    >
                      Client and Industry Background Materials
                    </h2>
                  </div>

                  {renderUploadSection(
                    "Client and Industry Background",
                    "Background Materials",
                  )}

                  {renderGroupedFiles(
                    groupedBackgroundMaterials,
                    sortedBackgroundProjects,
                    "No background materials available",
                  )}
                </div>
              </div>
            )}
          </>
        </div>
      </div>
    </div>
  );
}
