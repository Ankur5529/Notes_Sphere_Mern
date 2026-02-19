import "./Features.css";

export default function Features() {
  return (
    <div className="features">
      <div className="feature-card">
        <h3>📤 Upload Notes</h3>
        <p>
          Easily upload your PDF, DOC, or text files and store them securely.
        </p>
      </div>

      <div className="feature-card">
        <h3>🗂️ Organize Notes</h3>
        <p>
          Organize your notes by subject, topic, or category for quick access.
        </p>
      </div>

      <div className="feature-card">
        <h3>🌐 Access Anywhere</h3>
        <p>
          Access all your notes anytime from any device after login.
        </p>
      </div>
    </div>
  );
}
