import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  const getInitials = () => {
    if (!user) return '';
    return `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="navbar-logo">📅</span>
          <h1 className="navbar-title">PJ Agenda</h1>
        </div>

        <div className="navbar-menu">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <span className="nav-icon">📆</span>
            Calendrier
          </Link>
          <Link to="/calendars" className={`nav-link ${location.pathname === '/calendars' ? 'active' : ''}`}>
            <span className="nav-icon">🗂️</span>
            Mes Calendriers
          </Link>
        </div>

        <div className="navbar-right">
          <div className="navbar-profile" onClick={toggleDropdown}>
            <div className="profile-avatar">
              {getInitials()}
            </div>
            <div className="profile-info">
              <span className="profile-name">{user.prenom} {user.nom}</span>
              <span className="profile-email">{user.email}</span>
            </div>
            <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
          </div>

          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {getInitials()}
                </div>
                <div className="dropdown-user-info">
                  <strong>{user.prenom} {user.nom}</strong>
                  <span className="dropdown-email">{user.email}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => alert('Fonctionnalité à venir')}>
                <span className="dropdown-icon">👤</span>
                Mon Profil
              </button>
              <button className="dropdown-item" onClick={() => alert('Fonctionnalité à venir')}>
                <span className="dropdown-icon">⚙️</span>
                Paramètres
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={onLogout}>
                <span className="dropdown-icon">🚪</span>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
      {showDropdown && <div className="dropdown-backdrop" onClick={toggleDropdown}></div>}
    </nav>
  );
}

export default Navbar;
