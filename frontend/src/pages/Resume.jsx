import { useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../api/axios";

export default function Resume() {
  const [action, setAction] = useState("improve_resume");
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!resume.trim()) {
      setError("Please enter your resume.");
      return;
    }

    if (
      action === "tailor_resume" &&
      !jobDescription.trim()
    ) {
      setError(
        "Please enter a job description for resume tailoring."
      );
      return;
    }

    if (
      action === "cover_letter" &&
      !jobDescription.trim()
    ) {
      setError(
        "Please enter a job description for the cover letter."
      );
      return;
    }

    setError("");
    setResult("");
    setLoading(true);

    try {
      const response = await api.post(
        "/resume/generate",
        {
          action,
          resume,
          job_description: jobDescription,
        }
      );

      setResult(response.data.result);
    } catch (err) {
      console.error("Resume AI error:", err);

      const detail =
        err.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(
          detail
            .map(
              (item) =>
                item?.msg ||
                "Invalid request."
            )
            .join(", ")
        );
      } else {
        setError(
          "Failed to process the resume."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getActionTitle = () => {
    if (action === "improve_resume") {
      return "Improve Resume";
    }

    if (action === "tailor_resume") {
      return "Tailor Resume";
    }

    return "Generate Cover Letter";
  };

  return (
    <div className="resume-page">
      <div className="page-header">
        <h1>AI Resume Assistant</h1>

        <p>
          Improve, tailor and generate professional
          career documents using AI.
        </p>
      </div>

      <div className="resume-card">
        <form
          className="resume-form"
          onSubmit={handleSubmit}
        >
          {/* Action */}
          <div className="form-field">
            <label htmlFor="resume-action">
              AI Action
            </label>

            <select
              id="resume-action"
              value={action}
              onChange={(event) =>
                setAction(event.target.value)
              }
            >
              <option value="improve_resume">
                Improve Resume
              </option>

              <option value="tailor_resume">
                Tailor Resume for Job
              </option>

              <option value="cover_letter">
                Generate Cover Letter
              </option>
            </select>
          </div>

          {/* Resume */}
          <div className="form-field">
            <label htmlFor="resume-content">
              Resume
            </label>

            <textarea
              id="resume-content"
              value={resume}
              onChange={(event) =>
                setResume(event.target.value)
              }
              placeholder="Paste your resume here..."
              rows={14}
            />
          </div>

          {/* Job Description */}
          <div className="form-field">
            <label htmlFor="job-description">
              Job Description

              <span className="field-hint">
                {action === "improve_resume"
                  ? "(Optional)"
                  : "(Required)"}
              </span>
            </label>

            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(event) =>
                setJobDescription(
                  event.target.value
                )
              }
              placeholder={
                action === "improve_resume"
                  ? "Optional: paste a job description..."
                  : "Paste the job description here..."
              }
              rows={10}
            />
          </div>

          {error && (
            <div className="page-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : getActionTitle()}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="resume-result-card">
          <div className="result-header">
            <div>
              <h2>
                {action === "cover_letter"
                  ? "Generated Cover Letter"
                  : "AI Result"}
              </h2>

              <p>
                Generated by the SmartDesk AI
                assistant.
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigator.clipboard.writeText(
                  result
                )
              }
            >
              Copy
            </button>
          </div>

          <div className="resume-result-content markdown-content">
            <ReactMarkdown>
              {result}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}