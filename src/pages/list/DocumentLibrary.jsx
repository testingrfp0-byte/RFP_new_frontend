import { useDispatch, useSelector } from 'react-redux';
import {
  selectDocument,
  deleteDocumentRequest,
  resetDeleteState,
  startAiAnalysisRequest,
  generateDocumentRequest,
} from '../../features/modules/documents/documentsSlice';
import {
  selectDocuments,
  selectDocumentsLoading,
  selectSelectedDocument,
  selectDeleteSuccess,
  selectDocumentsError,
  selectAiAnalysisLoading,
  selectCurrentAnalyzingId,
} from '../../features/modules/documents/selectors';
import { useEffect, useState } from 'react';
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";
import { toast, ToastContainer } from "react-toastify";

const DocumentLibrary = ({
  isDarkMode,
  onDocumentSelect,
  showAdminActions = true,
  showDelete = false,
  documents: documentsProp,
  loading: loadingProp,
}) => {
  const dispatch = useDispatch();

  const reduxDocuments = useSelector(selectDocuments);
  const reduxLoading = useSelector(selectDocumentsLoading);
  const documents = documentsProp ?? reduxDocuments;
  const loading = loadingProp ?? reduxLoading;
  const selectedDocument = useSelector(selectSelectedDocument);
  const deleteSuccess = useSelector(selectDeleteSuccess);
  const deleteError = useSelector(selectDocumentsError);
  const aiAnalysisLoading = useSelector(selectAiAnalysisLoading);
  const currentAnalyzingId = useSelector(selectCurrentAnalyzingId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  useEffect(() => {
    if (deleteSuccess) {
      toast.success("Document deleted successfully");
      setIsDeleteDialogOpen(false);
      setDocToDelete(null);
      dispatch(resetDeleteState());
    }
  }, [deleteSuccess, dispatch]);

  useEffect(() => {
    if (deleteError) {
      toast.error(deleteError);
    }
  }, [deleteError]);

  const handleSelectDocument = (doc) => {
    if (selectedDocument?.id === doc.id) {
      dispatch(selectDocument(null));
      onDocumentSelect?.(null);
    } else {
      dispatch(selectDocument(doc));
      onDocumentSelect?.(doc);
    }
  };

  const handleAiAnalysis = (e, docId) => {
    e.stopPropagation();
    dispatch(startAiAnalysisRequest(docId));
  };

  const handleGenerateDoc = (e, docId) => {
    e.stopPropagation();
    dispatch(generateDocumentRequest(docId));
  };

  const handleDelete = (e, doc) => {
    e.stopPropagation();
    setDocToDelete(doc);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (docToDelete?.id) {
      dispatch(deleteDocumentRequest(docToDelete.id));
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
        >
          <span className="text-2xl">📄</span>
        </div>
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No documents uploaded yet
        </p>
        <p className="text-sm mt-1 text-gray-500">
          Upload your first RFP document to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`rounded-lg p-4 cursor-pointer transition-all duration-300 border
    ${selectedDocument?.id === doc.id
                ? 'border-4 border-purple-500 shadow-lg'
                : isDarkMode
                  ? 'border-gray-600'
                  : 'border-gray-200'
              }
    hover:border-purple-500 hover:shadow-lg
    ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}
  `}
            onClick={() => handleSelectDocument(doc)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                📄
              </div>

              <h3
                className={`font-semibold mb-2 truncate w-full text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                title={doc.filename}
              >
                {doc.project_name || doc.filename}
              </h3>

              <p className="text-xs mb-3 text-gray-500">
                {doc.uploaded_at &&
                  new Date(doc.uploaded_at).toLocaleDateString()}
              </p>

              <div className="flex flex-col gap-2 w-full mt-2">
                <div className="flex justify-center gap-2 w-full">
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDocument(doc);
                    }}
                  >
                    View Details
                  </button>

                  {showDelete && (
                    <button
                      onClick={(e) => handleDelete(e, doc)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {showAdminActions && (
                  <>
                    <button
                      onClick={(e) => handleAiAnalysis(e, doc.id)}
                      disabled={aiAnalysisLoading && currentAnalyzingId === doc.id}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs"
                    >
                      AI Analysis
                    </button>

                    <button
                      onClick={(e) => handleGenerateDoc(e, doc.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs"
                    >
                      Generate Doc
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${docToDelete?.project_name || docToDelete?.filename
          }"? This action cannot be undone.`}
      />
    </>
  );
};

export default DocumentLibrary;
