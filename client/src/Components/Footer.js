import "./Footer.css"

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <h3>📘 Notes Sphere</h3>
                <p>Your personal space to store and organize notes.</p>

                <div className="footer-links">
                    <a href="/#">About</a>
                    <a href="/#">Support</a>
                    <a href="/#">Contact</a>
                    <a href="/#">Privacy</a>
                </div>

                <p className="footer-copy">© 2026 Notes Sphere. All rights reserved.</p>
            </div>
        </footer>
    )
}