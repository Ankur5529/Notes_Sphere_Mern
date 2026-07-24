import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import SkeletonCard from "./SkeletonCard";

export default function SharedNote() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.body.style.backgroundColor = "#f0f2f5";
        const fetchNote = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/notes/shared/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setNote(data);
                } else {
                    setError(data.message || "This note is private or does not exist.");
                }
            } catch (err) {
                setError("Network error while trying to fetch the shared note.");
            } finally {
                setLoading(false);
            }
        };

        fetchNote();

        return () => {
            document.body.style.backgroundColor = "";
        };
    }, [id]);

    const handleView = (fileUrl) => {
        if (!fileUrl) return;
        const fullUrl = fileUrl.startsWith('/api') ? `${API_BASE}${fileUrl}` : fileUrl;
        window.open(fullUrl, "_blank", "noopener,noreferrer");
    };

    if (loading) {
        return (
            <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
                <SkeletonCard />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
                <h2>🔒 Private or Missing Note</h2>
                <p style={{ color: "#666", marginBottom: "20px" }}>{error}</p>
                <button 
                    onClick={() => navigate("/")} 
                    style={{ padding: "10px 20px", background: "#667eea", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
                >
                    Go to Homepage
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif" }}>
            <div style={{ background: "#fff", borderRadius: "12px", padding: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid #eee", paddingBottom: "20px", marginBottom: "20px" }}>
                    <h1 style={{ margin: 0, color: "#333", fontSize: "2rem" }}>{note.title}</h1>
                    <span style={{ color: "#888", fontSize: "0.9rem" }}>
                        Shared by {note.userId?.name || "a user"} on {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                </div>
                
                {note.description && (
                    <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#444", whiteSpace: "pre-wrap" }}>
                        {note.description}
                    </p>
                )}

                {note.fileUrl && (
                    <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px dashed #ccc" }}>
                        <h3 style={{ fontSize: "1rem", color: "#666", marginBottom: "10px" }}>Attached File</h3>
                        <button
                            onClick={() => handleView(note.fileUrl)}
                            style={{ 
                                display: "inline-flex", alignItems: "center", gap: "8px",
                                padding: "12px 24px", background: "#f8f9fa", color: "#333", 
                                border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer",
                                fontWeight: "bold", transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = "#eee"; e.currentTarget.style.borderColor = "#ccc"; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = "#f8f9fa"; e.currentTarget.style.borderColor = "#ddd"; }}
                        >
                            📎 View Attachment
                        </button>
                    </div>
                )}
            </div>
            
            <div style={{ textAlign: "center", marginTop: "30px" }}>
                <button 
                    onClick={() => navigate("/")} 
                    style={{ background: "none", border: "none", color: "#667eea", cursor: "pointer", textDecoration: "underline" }}
                >
                    Create your own Notes Sphere account
                </button>
            </div>
        </div>
    );
}
