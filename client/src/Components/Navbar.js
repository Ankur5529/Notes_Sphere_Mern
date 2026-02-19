import React from 'react';
import './Navbar.css';

export default function Navbar({onLoginClick, onSignupClick}) {
    return(
        <nav className="navbar">
            <div className="logo">📘 Notes Sphere</div>
            <div className="nav-links">
                <button className='login-link' onClick={onLoginClick}> Login</button>
                <button className='Signup-btn' onClick={onSignupClick}>Sign Up</button>
            </div>
        </nav>
    );
}