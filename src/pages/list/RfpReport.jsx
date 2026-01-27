import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import { Document, Page } from "react-pdf";
import { renderAsync } from "docx-preview";
import { pdfjs } from "react-pdf";
import { toast } from "react-toastify";
import {
  FETCH_RFP_DOCS_REQUEST,
  DELETE_RFP_DOC_REQUEST
} from "../../features/report/rfpReport/rfpReportTypes";
import {
  selectRfpDocs,
  selectRfpDocsLoading,
  selectRfpReportError,
} from "../../features/report/rfpReport/rfpReportSelectors";
import api from "../../services/apiHelper";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const RfpReport = () => {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();

  const pdfList = useSelector(selectRfpDocs);
  const pdfLoading = useSelector(selectRfpDocsLoading);
  const error = useSelector(selectRfpReportError);
  const [previewLoadingId, setPreviewLoadingId] = useState(null);
  const [downloadLoadingId, setDownloadLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const docxContainerRef = useRef(null);

  useEffect(() => {
    dispatch({ type: FETCH_RFP_DOCS_REQUEST });
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handlePreview = async (file) => {
    try {
      setPreviewLoadingId(file.document_id);

      const res = await api.get(file.download_url, {
        responseType: "blob",
      });

      const blob = res.data;

      if (blob.size < 1000) {
        toast.error("Invalid document received");
        return;
      }

      const url = URL.createObjectURL(blob);

      let detectedType = blob.type;
      if (!detectedType && file.file_name.endsWith(".docx")) {
        detectedType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      }
      if (!detectedType && file.file_name.endsWith(".pdf")) {
        detectedType = "application/pdf";
      }

      setPreviewUrl(url);
      setFileType(detectedType);
      setPreviewFile(file);
      setIsModalOpen(true);

      if (detectedType?.includes("word")) {
        setTimeout(() => {
          if (docxContainerRef.current) {
            docxContainerRef.current.innerHTML = "";
            renderAsync(blob, docxContainerRef.current, null, {
              className: "docx-preview",
              inWrapper: true,
              ignoreWidth: false,
              ignoreHeight: false,
              ignoreFonts: false,
              breakPages: true,
              ignoreLastRenderedPageBreak: false,
              experimental: false,
              trimXmlDeclaration: true,
              useBase64URL: false,
              useMathMLPolyfill: false,
              renderChanges: false,
              renderHeaders: true,
              renderFooters: true,
              renderFootnotes: true,
              renderEndnotes: true,
            });
          }
        }, 100);
      }
    } catch (e) {
      console.error(e);
      toast.error("Preview failed");
    } finally {
      setPreviewLoadingId(null);
    }
  };

  const handleDownload = async (file) => {
    try {
      setDownloadLoadingId(file.document_id);

      const res = await api.get(file.download_url, {
        responseType: "blob",
      });

      const blob = res.data;

      if (blob.size < 1000) {
        toast.error("Downloaded file is corrupted");
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("Download failed");
    } finally {
      setDownloadLoadingId(null);
    }
  };

  const handleDeleteClick = (file) => {
    if (!file.document_id) {
      toast.error("Document ID not found");
      return;
    }

    setSelectedDoc(file);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedDoc?.document_id) return;

    setDeleteLoadingId(selectedDoc.document_id);

    dispatch({
      type: DELETE_RFP_DOC_REQUEST,
      payload: selectedDoc.document_id,
    });

    setIsConfirmOpen(false);
    setSelectedDoc(null);
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
    setSelectedDoc(null);
  };

  useEffect(() => {
    if (!pdfLoading) {
      setDeleteLoadingId(null);
    }
  }, [pdfLoading]);

  const closeModal = () => {
    setIsModalOpen(false);
    setPreviewFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileType(null);
    setNumPages(null);
    if (docxContainerRef.current) docxContainerRef.current.innerHTML = "";
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
            <span className="text-4xl">📑</span>
            Proposals Reports
          </h1>

          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              Preview, download & delete generated proposal documents
          </p>
        </div>

        {/* Main Card */}
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
              Proposals
            </h2>
          </div>

          {/* Loading */}
          {pdfLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
              <span
                className={`ml-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
              >
                Loading documents...
              </span>
            </div>
          ) : pdfList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pdfList.map((pdf, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 transition-all hover:border-purple-500 hover:shadow-lg group ${isDarkMode
                    ? "bg-gray-700 border border-gray-600"
                    : "bg-gray-50 border border-gray-200"
                    }`}
                >
                  <div className="flex flex-col items-center justify-between h-full text-center">
                    {/* Top Icon */}
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                      <span className="text-purple-400 text-xl">📄</span>
                    </div>

                    {/* File Name */}
                    <p
                      className={`text-sm break-all mb-4 ${isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                    >
                      {pdf.file_name}
                    </p>

                    {/* Buttons Row */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handlePreview(pdf)}
                        disabled={previewLoadingId === pdf.document_id}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 disabled:opacity-60"
                      >
                        {previewLoadingId === pdf.document_id && (
                          <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        Preview
                      </button>

                      <button
                        onClick={() => handleDownload(pdf)}
                        disabled={downloadLoadingId === pdf.document_id}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-2 disabled:opacity-60"
                      >
                        {downloadLoadingId === pdf.document_id && (
                          <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        Download
                      </button>
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleDeleteClick(pdf)}
                        disabled={deleteLoadingId === pdf.document_id}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 disabled:opacity-60"
                      >
                        {deleteLoadingId === pdf.document_id && (
                          <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div
                className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
              >
                <span
                  className={`text-2xl ${isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                >
                  📄
                </span>
              </div>

              <p
                className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
              >
                No documents found
              </p>

              <p className="text-sm mt-1 text-gray-500">
                Generated proposals will appear here
              </p>
            </div>
          )}
        </div>

        {/* Modal - FIXED FOR PROPER PAGE COUNT */}
        {isModalOpen && previewFile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            onClick={closeModal}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] overflow-hidden relative p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-700 dark:text-gray-300 text-3xl font-bold hover:text-red-600 z-10"
              >
                &times;
              </button>

              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {previewFile.file_name}
                </h3>
                {numPages && (
                  <p className="text-sm text-gray-500">Total Pages: {numPages}</p>
                )}
              </div>

              {/* PDF Preview - Fixed with proper scale */}
              {fileType === "application/pdf" && previewUrl && (
                <div className="w-full max-h-[80vh] overflow-y-auto">
                  <Document
                    file={previewUrl}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  >
                    {Array.from(new Array(numPages), (_, index) => (
                      <Page
                        key={index}
                        pageNumber={index + 1}
                        scale={1.0}
                        width={750}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    ))}
                  </Document>
                </div>
              )}

              {/* DOCX Preview - Fixed with proper options */}
              {fileType?.includes("word") && previewUrl && (
                <div
                  ref={docxContainerRef}
                  className="w-full h-[80vh] overflow-auto bg-white text-black p-4"
                  style={{
                    fontSize: '12pt',
                    lineHeight: '1.5',
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
      
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        title="Delete Document"
        message={`Are you sure you want to delete "${selectedDoc?.file_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default RfpReport;