import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../api/axios";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const [aiAction, setAiAction] = useState("improve");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  const loadNotes = async () => {
    try {
      setError("");

      const response = await api.get("/notes/");
      setNotes(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load notes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchNotes = async () => {
      try {
        const response = await api.get("/notes/");

        if (!cancelled) {
          setNotes(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              "Failed to load notes."
          );
          setLoading(false);
        }
      }
    };

    fetchNotes();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      await api.post("/notes/", {
        title: title.trim(),
        content: content.trim(),
        category_id: null,
      });

      setTitle("");
      setContent("");

      await loadNotes();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to create note."
      );
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setAiResult("");
    setError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleUpdate = async (noteId) => {
    if (
      !editTitle.trim() ||
      !editContent.trim()
    ) {
      setError(
        "Title and content are required."
      );
      return;
    }

    try {
      setUpdatingId(noteId);
      setError("");

      await api.put(`/notes/${noteId}`, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });

      cancelEditing();
      await loadNotes();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to update note."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (noteId) => {
    const confirmed = window.confirm(
      "Delete this note?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(noteId);
      setError("");

      await api.delete(`/notes/${noteId}`);

      await loadNotes();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to delete note."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleAI = async (noteContent) => {
    try {
      setAiLoading(true);
      setError("");
      setAiResult("");

      const response = await api.post("/notes/ai", {
        action: aiAction,
        content: noteContent,
      });

      setAiResult(response.data.result);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "AI processing failed."
      );
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="notes-page">
        <div className="page-header">
          <h1>Notes</h1>
          <p>Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-page">
      <div className="page-header">
        <h1>Notes</h1>

        <p>
          Create, manage and improve your notes
          with AI.
        </p>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {/* Create Note */}
      <section className="notes-create-card">
        <div className="section-header">
          <div>
            <h2>Create Note</h2>

            <p>
              Capture ideas, information and
              important thoughts.
            </p>
          </div>
        </div>

        <form
          className="notes-form"
          onSubmit={handleCreate}
        >
          <div className="form-field">
            <label htmlFor="note-title">
              Title
            </label>

            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Enter note title"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="note-content">
              Content
            </label>

            <textarea
              id="note-content"
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder="Write your note..."
              rows={7}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={creating}
          >
            {creating
              ? "Creating..."
              : "Create Note"}
          </button>
        </form>
      </section>

      {/* Notes */}
      <section className="notes-list-section">
        <div className="section-header">
          <div>
            <h2>Your Notes</h2>

            <p>
              View and manage your saved notes.
            </p>
          </div>

          <span className="notes-count">
            {notes.length}{" "}
            {notes.length === 1
              ? "note"
              : "notes"}
          </span>
        </div>

        {notes.length === 0 ? (
          <div className="empty-state">
            <h3>No notes yet</h3>

            <p>
              Create your first note using the
              form above.
            </p>
          </div>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <article
                key={note.id}
                className="note-card"
              >
                {editingId === note.id ? (
                  <div className="note-edit">
                    <div className="note-card-header">
                      <h3>Edit Note</h3>
                    </div>

                    <div className="form-field">
                      <label
                        htmlFor={`edit-title-${note.id}`}
                      >
                        Title
                      </label>

                      <input
                        id={`edit-title-${note.id}`}
                        type="text"
                        value={editTitle}
                        onChange={(event) =>
                          setEditTitle(
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label
                        htmlFor={`edit-content-${note.id}`}
                      >
                        Content
                      </label>

                      <textarea
                        id={`edit-content-${note.id}`}
                        value={editContent}
                        onChange={(event) =>
                          setEditContent(
                            event.target.value
                          )
                        }
                        rows={8}
                      />
                    </div>

                    <div className="note-actions">
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          handleUpdate(note.id)
                        }
                        disabled={
                          updatingId === note.id
                        }
                      >
                        {updatingId === note.id
                          ? "Saving..."
                          : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="note-card-header">
                      <div>
                        <h3>{note.title}</h3>

                        {note.category && (
                          <span className="note-category">
                            {note.category.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="note-content markdown-content">
                      <ReactMarkdown>
                        {note.content}
                      </ReactMarkdown>
                    </div>

                    <div className="note-card-footer">
                      <div className="note-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            startEditing(note)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() =>
                            handleDelete(note.id)
                          }
                          disabled={
                            deletingId === note.id
                          }
                        >
                          {deletingId === note.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>

                      <div className="note-ai-controls">
                        <select
                          value={aiAction}
                          onChange={(event) =>
                            setAiAction(
                              event.target.value
                            )
                          }
                        >
                          <option value="improve">
                            Improve
                          </option>

                          <option value="summarize">
                            Summarize
                          </option>

                          <option value="grammar">
                            Grammar & Spelling
                          </option>

                          <option value="bullets">
                            Convert to Bullets
                          </option>

                          <option value="explain">
                            Explain Simply
                          </option>
                        </select>

                        <button
                          type="button"
                          className="ai-button"
                          onClick={() =>
                            handleAI(
                              note.content
                            )
                          }
                          disabled={aiLoading}
                        >
                          {aiLoading
                            ? "Processing..."
                            : "✦ Use AI"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* AI Result */}
      {aiResult && (
        <section className="notes-ai-result">
          <div className="section-header">
            <div>
              <h2>AI Result</h2>

              <p>
                Generated from your selected note.
              </p>
            </div>
          </div>

          <div className="ai-result-content markdown-content">
            <ReactMarkdown>
              {aiResult}
            </ReactMarkdown>
          </div>
        </section>
      )}
    </div>
  );
}