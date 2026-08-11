import { useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../api/axios";

export default function PDF() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");
    setSummary("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setFile(null);
      setError("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
  };

  const getErrorMessage = (err) => {
    const detail = err.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item?.msg) {
            return item.msg;
          }

          return "Invalid request.";
        })
        .join(", ");
    }

    return "Failed to summarize the PDF.";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setError("");
    setSummary("");
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await api.post(
        "/pdf/summarize",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSummary(response.data.summary);
    } catch (err) {
      console.error(
        "PDF summarization error:",
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-page">
      <div className="page-header">
        <h1>PDF Summarizer</h1>

        <p>
          Upload a PDF and let AI generate a clear
          summary.
        </p>
      </div>

      <div className="pdf-card">
        <form
          className="pdf-form"
          onSubmit={handleSubmit}
        >
          <div className="form-field">
            <label htmlFor="pdf-file">
              Select PDF
            </label>

            <input
              id="pdf-file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <div className="pdf-selected-file">
              <span className="pdf-file-icon">
                PDF
              </span>

              <div>
                <strong>{file.name}</strong>

                <span>
                  {(file.size / 1024 / 1024).toFixed(
                    2
                  )}{" "}
                  MB
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="page-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={!file || loading}
          >
            {loading
              ? "Summarizing..."
              : "Summarize PDF"}
          </button>
        </form>
      </div>

      {summary && (
        <div className="pdf-summary-card">
          <div className="pdf-summary-header">
            <div>
              <h2>AI Summary</h2>

              <p>
                Generated from your uploaded PDF.
              </p>
            </div>
          </div>

          <div className="pdf-summary-content markdown-content">
            <ReactMarkdown>
              {summary}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}