import React, { useState, useEffect } from 'react';
import './EventModal.css';

function EventModal({ isOpen, onClose, onSave, onDelete, eventData, startDate, endDate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    type: '',
    backgroundColor: '#3788d8',
    recurrent: false,
    typeRecurrence: '',
    dateFinRecurrence: ''
  });

  useEffect(() => {
    if (eventData) {
      // Mode édition
      setFormData({
        title: eventData.title || '',
        description: eventData.description || '',
        start: eventData.start || '',
        end: eventData.end || '',
        type: eventData.type || '',
        backgroundColor: eventData.backgroundColor || '#3788d8',
        recurrent: eventData.recurrent || false,
        typeRecurrence: eventData.typeRecurrence || '',
        dateFinRecurrence: eventData.dateFinRecurrence || ''
      });
    } else if (startDate && endDate) {
      // Mode création
      setFormData({
        title: '',
        description: '',
        start: startDate,
        end: endDate,
        type: '',
        backgroundColor: '#3788d8',
        recurrent: false,
        typeRecurrence: '',
        dateFinRecurrence: ''
      });
    }
  }, [eventData, startDate, endDate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{eventData ? 'Modifier l\'événement' : 'Nouvel événement'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Ex: Cours de Symfony"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Détails de l'événement..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start">Date de début *</label>
              <input
                type="datetime-local"
                id="start"
                name="start"
                value={formData.start}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end">Date de fin *</label>
              <input
                type="datetime-local"
                id="end"
                name="end"
                value={formData.end}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type d'événement</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="">-- Sélectionner --</option>
                <option value="cours">Cours</option>
                <option value="tp">Travaux Pratiques</option>
                <option value="examen">Examen</option>
                <option value="reunion">Réunion</option>
                <option value="conference">Conférence</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="backgroundColor">Couleur</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  id="backgroundColor"
                  name="backgroundColor"
                  value={formData.backgroundColor}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={handleChange}
                  name="backgroundColor"
                  placeholder="#3788d8"
                />
              </div>
            </div>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="recurrent"
              name="recurrent"
              checked={formData.recurrent}
              onChange={handleChange}
            />
            <label htmlFor="recurrent">Événement récurrent</label>
          </div>

          {formData.recurrent && (
            <>
              <div className="form-group">
                <label htmlFor="typeRecurrence">Type de récurrence</label>
                <select
                  id="typeRecurrence"
                  name="typeRecurrence"
                  value={formData.typeRecurrence}
                  onChange={handleChange}
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="quotidienne">Quotidienne</option>
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="mensuelle">Mensuelle</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dateFinRecurrence">Date de fin de récurrence</label>
                <input
                  type="date"
                  id="dateFinRecurrence"
                  name="dateFinRecurrence"
                  value={formData.dateFinRecurrence}
                  onChange={handleChange}
                  placeholder="Jusqu'à quand répéter l'événement"
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            {eventData && (
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={() => onDelete(eventData.id)}
              >
                Supprimer
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              {eventData ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;
