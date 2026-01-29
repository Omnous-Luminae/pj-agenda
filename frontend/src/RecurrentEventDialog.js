import React from 'react';
import './RecurrentEventDialog.css';

function RecurrentEventDialog({ isOpen, eventTitle, onViewOriginal, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="recurrent-overlay" onClick={onCancel}>
      <div className="recurrent-content" onClick={(e) => e.stopPropagation()}>
        <div className="recurrent-header">
          <h3>Événement récurrent</h3>
        </div>
        <div className="recurrent-body">
          <p>
            <strong>"{eventTitle}"</strong> est une occurrence d'un événement récurrent.
          </p>
          <p>
            Les occurrences ne peuvent pas être modifiées individuellement. 
            Vous pouvez consulter et modifier l'événement original pour apporter des changements à toutes les occurrences.
          </p>
        </div>
        <div className="recurrent-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Fermer
          </button>
          <button className="btn btn-primary" onClick={onViewOriginal}>
            Voir l'événement original
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecurrentEventDialog;
