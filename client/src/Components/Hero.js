import React from 'react';
import "./Hero.css";

export default function Hero({ onStart }) {
    return (
        <div className="hero">
            <h1>All your Notes, one Smart Place</h1>
            <p>Organize your notes by subjects, topics, and tags. Never lose Your notes again.</p>
            <button className="get-started-btn" onClick={onStart}>Start Organizing</button>
        </div>
    );
}