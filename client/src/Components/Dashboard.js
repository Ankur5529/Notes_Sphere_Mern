import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./Dashboard.css";
import { API_BASE } from "../config";
import SkeletonCard from "./SkeletonCard";

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // inline confirm
  const fileInputRef = useRef(null);
  const titleInputRef = useRef(null);

  // Read user info from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const isGuest = userData?.isGuest;
  const userName = userData?.name || "User";

  // ── Show a toast for 3 seconds ─────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
    navigate("/");
  };

  // ── Fetch notes from API ───────────────────────────────────────
  const fetchNotes = async () => {
    setFetching(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/notes?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setNotes(data.notes ?? data); // support both paginated and legacy response
      } else {
        console.error("Failed to fetch notes", data);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = "#f0f2f5";
    fetchNotes();
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Upload a note ──────────────────────────────────────────────
  const handleUpload = async (e) => {
    e?.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      titleInputRef.current?.focus();
      return;
    }

    setError("");
    setLoading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (file) formData.append("noteFile", file);

    try {
      const res = await fetch(`${API_BASE}/api/notes/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setNotes((prev) => [data, ...prev]);
        setTitle("");
        setDescription("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        showToast("✅ Note uploaded successfully!");
      } else {
        setError(data.message || "Upload failed.");
      }
    } catch (err) {
      setError("Network error while uploading.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Delete a note ──────────────────────────────────────────────
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotes((prev) => prev.filter((note) => note._id !== id));
        setConfirmDeleteId(null);
        showToast("🗑️ Note deleted.");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete note.");
        setConfirmDeleteId(null);
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      setError("Network error while deleting.");
      setConfirmDeleteId(null);
    }
  };

  // ── Edit helpers ───────────────────────────────────────────────
  const startEditing = (note) => {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditDescription(note.description || "");
  };

  const handleEditSave = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      if (res.ok) {
        const updatedNote = await res.json();
        setNotes((prev) => prev.map((n) => (n._id === id ? updatedNote : n)));
        setEditingId(null);
        showToast("✏️ Note updated!");
      } else {
        setError("Failed to update note.");
      }
    } catch (err) {
      console.error("Error updating note:", err);
    }
  };

  const handlePin = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/notes/${id}/pin`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updatedNote = await res.json();
        setNotes((prev) => prev.map((n) => (n._id === id ? updatedNote : n)));
        showToast(updatedNote.isPinned ? "📌 Note pinned to top!" : "📍 Note unpinned.");
      }
    } catch (err) {
      console.error("Error pinning note:", err);
    }
  };

  const handleShare = async (note) => {
    const token = localStorage.getItem("token");
    try {
      // If it's already shared, we toggle it off. Or we can just copy link if it's shared.
      // But let's toggle it.
      const res = await fetch(`${API_BASE}/api/notes/${note._id}/share`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updatedNote = await res.json();
        setNotes((prev) => prev.map((n) => (n._id === note._id ? updatedNote : n)));
        
        if (updatedNote.isShared) {
          const shareUrl = `${window.location.origin}/shared/${note._id}`;
          navigator.clipboard.writeText(shareUrl);
          showToast("🔗 Link copied to clipboard! Anyone can now view this note.");
        } else {
          showToast("🔒 Note is now private.");
        }
      }
    } catch (err) {
      console.error("Error sharing note:", err);
    }
  };

  const handleView = (fileUrl) => {
    if (!fileUrl) {
      alert("No file attached to this note.");
      return;
    }
    // If the file URL is a relative API path (from GridFS), prepend the backend API_BASE
    // This ensures it works perfectly even when Frontend (Vercel) and Backend (Render) are hosted separately.
    const fullUrl = fileUrl.startsWith('/api') ? `${API_BASE}${fileUrl}` : fileUrl;
    
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  const filteredNotes = notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.description &&
          note.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="dashboard">
      {/* ── Toast Notification ─────────────────────────────────── */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="dash-header">
        <div className="dash-title" aria-label="Notes Sphere app">
          📘<span> Notes Sphere</span>
        </div>
        <div className="dash-user">
          <span aria-label={`Logged in as ${userName}`}>
            Welcome, <strong>{userName}</strong>!
          </span>
          <button
            className="logout-btn"
            onClick={handleLogout}
            aria-label="Log out of your account"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ── Guest Banner ───────────────────────────────────────── */}
      {isGuest && (
        <div className="guest-banner" role="note">
          👤 You're using a <strong>Guest Account</strong>. Your notes won't be
          saved after the session. &nbsp;
          <button
            className="banner-link"
            onClick={() => navigate("/")}
            aria-label="Sign up for a free account"
          >
            Create a free account →
          </button>
        </div>
      )}

      {/* ── Upload Card ────────────────────────────────────────── */}
      <section className="upload-card" aria-label="Upload a new note">
        <h2>➕ Upload a New Note</h2>
        {error && (
          <p className="error-banner" role="alert" aria-live="assertive">
            {error}
          </p>
        )}
        <form className="upload-form" onSubmit={handleUpload} noValidate>
          <label htmlFor="note-title">
            Note Title <span aria-hidden="true" className="required">*</span>
          </label>
          <input
            id="note-title"
            ref={titleInputRef}
            type="text"
            placeholder="e.g. Chapter 5 – Data Structures"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-required="true"
          />

          <label htmlFor="note-description">Description (optional)</label>
          <textarea
            id="note-description"
            placeholder="Short summary of this note…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="upload-row">
            <label htmlFor="fileInput" className="file-label">
              📎 Choose File
              <input
                id="fileInput"
                ref={fileInputRef}
                type="file"
                className="file-input-hidden"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                onChange={(e) => setFile(e.target.files[0])}
                aria-label="Choose a file to attach to the note"
              />
            </label>
            {file && (
              <span className="file-name" aria-live="polite">
                {file.name}
              </span>
            )}
            <button
              className="upload-btn"
              type="submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Uploading…" : "Upload Note"}
            </button>
          </div>
        </form>
      </section>

      {/* ── Notes Section ──────────────────────────────────────── */}
      <section aria-label="My notes">
        <div className="notes-header-row">
          <h2 className="notes-heading">📂 My Notes</h2>
          <label htmlFor="search-notes" className="sr-only">
            Search notes
          </label>
          <input
            id="search-notes"
            type="search"
            className="search-bar"
            placeholder="Search by title or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search your notes"
          />
        </div>

        <div className="notes-grid" role="list" aria-label="Notes list">
          {fetching ? (
            // ── Skeleton Loading ──
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : filteredNotes.length === 0 ? (
            <div className="note-card empty" role="listitem">
              <p>📭 No notes found. Add your first note above!</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <article className="note-card" key={note._id} role="listitem">
                {editingId === note._id ? (
                  <div className="edit-form" aria-label={`Editing note: ${note.title}`}>
                    <label htmlFor={`edit-title-${note._id}`} className="sr-only">
                      Edit title
                    </label>
                    <input
                      id={`edit-title-${note._id}`}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="edit-input"
                      aria-required="true"
                    />
                    <label htmlFor={`edit-desc-${note._id}`} className="sr-only">
                      Edit description
                    </label>
                    <textarea
                      id={`edit-desc-${note._id}`}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="edit-textarea"
                    />
                    <div className="note-actions">
                      <button
                        className="save-btn"
                        onClick={() => handleEditSave(note._id)}
                        aria-label="Save changes"
                      >
                        Save
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => setEditingId(null)}
                        aria-label="Cancel editing"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="note-header-flex">
                      <h3>
                        {note.title}
                        {note.isPinned && <span className="pin-badge" title="Pinned Note">📌</span>}
                        {note.isShared && <span className="share-badge" title="Shared Note">🌍</span>}
                      </h3>
                      <time
                        className="note-date"
                        dateTime={note.createdAt}
                        aria-label={`Created on ${new Date(note.createdAt).toLocaleDateString()}`}
                      >
                        {new Date(note.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    {note.description && <p>{note.description}</p>}
                    <div className="note-actions">
                      {note.fileUrl && (
                        <button
                          className="view-btn"
                          onClick={() => handleView(note.fileUrl)}
                          aria-label={`View file for note: ${note.title}`}
                        >
                          View File
                        </button>
                      )}
                      <button
                        className="edit-btn"
                        onClick={() => startEditing(note)}
                        aria-label={`Edit note: ${note.title}`}
                      >
                        Edit
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handlePin(note._id)}
                        aria-label={note.isPinned ? "Unpin note" : "Pin note"}
                      >
                        {note.isPinned ? "Unpin" : "Pin"}
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handleShare(note)}
                        aria-label={note.isShared ? "Unshare note" : "Share note"}
                      >
                        {note.isShared ? "Unshare" : "Share"}
                      </button>
                      {confirmDeleteId === note._id ? (
                        <>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(note._id)}
                            aria-label="Confirm delete"
                          >
                            ✓ Confirm
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={() => setConfirmDeleteId(null)}
                            aria-label="Cancel delete"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="delete-btn"
                          onClick={() => setConfirmDeleteId(note._id)}
                          aria-label={`Delete note: ${note.title}`}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
