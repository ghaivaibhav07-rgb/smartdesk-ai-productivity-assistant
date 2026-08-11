import { useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../api/axios";

export default function Email() {
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState("Professional");
  const [details, setDetails] = useState("");

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!purpose.trim() || !details.trim()) {
      setError(
        "Please provide the purpose and details."
      );
      return;
    }

    setError("");
    setEmail("");
    setLoading(true);

    try {
      const response = await api.post(
        "/email/generate",
        {
          purpose,
          tone,
          details,
        }
      );

      setEmail(response.data.email);
    } catch (err) {
      console.error(
        "Email generation error:",
        err
      );

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
          "Failed to generate the email."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-page">
      <div className="page-header">
        <h1>AI Email Generator</h1>

        <p>
          Generate professional emails using AI.
        </p>
      </div>

      <div className="email-card">
        <form
          className="email-form"
          onSubmit={handleSubmit}
        >
          {/* Purpose */}
          <div className="form-field">
            <label htmlFor="email-purpose">
              Purpose
            </label>

            <input
              id="email-purpose"
              type="text"
              value={purpose}
              onChange={(event) =>
                setPurpose(event.target.value)
              }
              placeholder="e.g. Request an internship interview"
            />
          </div>

          {/* Tone */}
          <div className="form-field">
            <label htmlFor="email-tone">
              Tone
            </label>

            <select
              id="email-tone"
              value={tone}
              onChange={(event) =>
                setTone(event.target.value)
              }
            >
              <option value="Professional">
                Professional
              </option>

              <option value="Formal">
                Formal
              </option>

              <option value="Friendly">
                Friendly
              </option>

              <option value="Polite">
                Polite
              </option>

              <option value="Concise">
                Concise
              </option>
            </select>
          </div>

          {/* Details */}
          <div className="form-field">
            <label htmlFor="email-details">
              Details
            </label>

            <textarea
              id="email-details"
              value={details}
              onChange={(event) =>
                setDetails(event.target.value)
              }
              placeholder="Describe the information you want included in the email..."
              rows={8}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="page-error">
              {error}
            </div>
          )}

          {/* Generate */}
          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : "Generate Email"}
          </button>
        </form>
      </div>

      {/* Generated Email */}
      {email && (
        <div className="email-result-card">
          <div className="result-header">
            <div>
              <h2>Generated Email</h2>

              <p>
                Your AI-generated email is ready.
              </p>
            </div>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigator.clipboard.writeText(
                  email
                )
              }
            >
              Copy
            </button>
          </div>

          <div className="email-result-content markdown-content">
            <ReactMarkdown>
              {email}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}