import React, { useState, useEffect } from 'react';
import './CalendarManagement.css';

function CalendarManagement({ user }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/calendars/${userId}`);
      const data = await response.json();
      setCalendars(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des calendriers:', error);
      setLoading(false);
    }
  };

  const handleCreateCalendar = async () => {
    if (!newCalendarName.trim()) {
      alert('Veuillez entrer un nom de calendrier');
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:8000/api/calendars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: newCalendarName,
          userId: parseInt(userId),
          estCommun: isShared
        })
      });

      if (response.ok) {
        setNewCalendarName('');
        setIsShared(false);
        setShowCreateModal(false);
        fetchCalendars();
      } else {
        alert('Erreur lors de la création du calendrier');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du calendrier');
    }
  };

  const handleDeleteCalendar = async (calendarId, isCommon) => {
    if (isCommon) {
      alert('Impossible de supprimer un calendrier commun');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce calendrier ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/calendars/${calendarId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCalendars();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du calendrier');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      proprietaire: { text: 'Propriétaire', class: 'badge-owner' },
      contributeur: { text: 'Contributeur', class: 'badge-contributor' },
      lecteur: { text: 'Lecteur', class: 'badge-reader' }
    };
    return badges[role] || badges.lecteur;
  };

  if (loading) {
    return (
      <div className="calendar-management">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Chargement des calendriers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-management">
      <div className="management-header">
        <div className="header-content">
          <h1>Gestion des Calendriers</h1>
          <p className="subtitle">Gérez vos calendriers personnels et partagés</p>
        </div>
        <button className="btn-create" onClick={() => setShowCreateModal(true)}>
          <span className="btn-icon">➕</span>
          Nouveau Calendrier
        </button>
      </div>

      <div className="calendars-grid">
        {calendars.map(calendar => (
          <div key={calendar.id} className={`calendar-card ${calendar.isCommon ? 'common' : ''}`}>
            <div className="card-header">
              <div className="card-icon">
                {calendar.isCommon ? '🌍' : '📅'}
              </div>
              <div className="card-title-section">
                <h3 className="card-title">{calendar.nom}</h3>
                <span className={`role-badge ${getRoleBadge(calendar.role).class}`}>
                  {getRoleBadge(calendar.role).text}
                </span>
              </div>
            </div>

            <div className="card-stats">
              <div className="stat-item">
                <span className="stat-icon">📊</span>
                <div className="stat-info">
                  <span className="stat-value">{calendar.eventCount}</span>
                  <span className="stat-label">Événements</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">👥</span>
                <div className="stat-info">
                  <span className="stat-value">{calendar.sharedWith}</span>
                  <span className="stat-label">Partagé avec</span>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button className="btn-action btn-view">
                <span className="action-icon">👁️</span>
                Voir
              </button>
              {calendar.role === 'proprietaire' && (
                <>
                  <button className="btn-action btn-edit">
                    <span className="action-icon">✏️</span>
                    Modifier
                  </button>
                  <button className="btn-action btn-share">
                    <span className="action-icon">🔗</span>
                    Partager
                  </button>
                </>
              )}
              {calendar.role === 'proprietaire' && !calendar.isCommon && (
                <button 
                  className="btn-action btn-delete"
                  onClick={() => handleDeleteCalendar(calendar.id, calendar.isCommon)}
                >
                  <span className="action-icon">🗑️</span>
                  Supprimer
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Carte pour créer un nouveau calendrier */}
        <div className="calendar-card card-add" onClick={() => setShowCreateModal(true)}>
          <div className="add-content">
            <div className="add-icon">➕</div>
            <h3>Créer un nouveau calendrier</h3>
            <p>Organisez vos événements avec un nouveau calendrier personnalisé</p>
          </div>
        </div>
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}></div>
          <div className="create-modal">
            <div className="modal-header">
              <h2>Nouveau Calendrier</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="calendarName">Nom du calendrier</label>
                <input
                  id="calendarName"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Cours 2ème année, Projet personnel..."
                  value={newCalendarName}
                  onChange={(e) => setNewCalendarName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Options de partage</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="shareOption" 
                      value="private" 
                      checked={!isShared}
                      onChange={() => setIsShared(false)}
                    />
                    <div className="radio-content">
                      <span className="radio-icon">🔒</span>
                      <div>
                        <strong>Privé</strong>
                        <p>Uniquement visible par vous</p>
                      </div>
                    </div>
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="shareOption" 
                      value="shared"
                      checked={isShared}
                      onChange={() => setIsShared(true)}
                    />
                    <div className="radio-content">
                      <span className="radio-icon">👥</span>
                      <div>
                        <strong>Partagé</strong>
                        <p>Visible par les utilisateurs que vous choisissez</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                Annuler
              </button>
              <button className="btn-confirm" onClick={handleCreateCalendar}>
                Créer le calendrier
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CalendarManagement;
