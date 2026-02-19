import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Dashboard.css";

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
    navigate("/");
  };

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setNotes(data);
      } else {
        console.error("Failed to fetch notes", data);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  useEffect(() => {
    document.body.style.backgroundColor = "#f0f2f5";
    fetchNotes();
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const handleUpload = async () => {
    if (!title) {
      setError("Title is required");
      return;
    }

    setError("");
    setLoading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (file) {
      formData.append("noteFile", file);
    }

    try {
      const res = await fetch("http://localhost:5000/api/notes/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setNotes([...notes, data]);
        setTitle("");
        setDescription("");
        setFile(null);
        // Reset file input value if possible, or just rely on state
        document.getElementById("fileInput").value = null;
      } else {
        setError(data.message || "Upload failed");
      }
    } catch (err) {
      setError("Error uploading note");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setNotes(notes.filter(note => note._id !== id));
      } else {
        alert("Failed to delete note");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const handleView = (fileUrl) => {
    if (fileUrl) {
      window.open(`http://localhost:5000${fileUrl}`, "_blank");
    } else {
      alert("No file attached to this note.");
    }
  };

  return (
    <div className="dashboard">
      {/*Header*/}
      <div className="dash-header">
        <div className="dash-title">
          📘<span> Notes Sphere</span>
        </div>
        <div className="dash-user">
          <span> Welcome!</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      {/* Upload Card*/}
      <div className="upload-card">
        <h3>➕ Upload a New Note </h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="upload-form">
          <input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Short Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <div className="upload-row">
            <input
              id="fileInput"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button className="upload-btn" onClick={handleUpload} disabled={loading}>
              {loading ? "Uploading..." : "Upload Note"}
            </button>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <h3 className="notes-heading">📂 My Notes</h3>

      <div className="notes-grid">
        {notes.length === 0 ? (
          <div className="note-card empty">
            <p>📭 No notes found. Upload one!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div className="note-card" key={note._id}>
              <h4>{note.title}</h4>
              <p>{note.description}</p>
              <div className="note-actions">
                <button className="view-btn" onClick={() => handleView(note.fileUrl)}>View</button>
                {/* Download can be same as view or use 'download' attribute if sending file directly */}
                {/* <button className="download-btn">Download</button> */}
                <button className="delete-btn" onClick={() => handleDelete(note._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
