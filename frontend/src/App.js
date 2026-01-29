import './App.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState, useEffect, useMemo, useRef } from 'react';
import EventModal from './EventModal';
import ConfirmDialog from './ConfirmDialog';
import RecurrentEventDialog from './RecurrentEventDialog';
import { processEventsWithRecurrence } from './utils/recurrence';

function App() {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDates, setSelectedDates] = useState({ start: '', end: '' });
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const calendarRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, eventId: null });
  const [recurrentDialog, setRecurrentDialog] = useState({ isOpen: false, event: null });

  // Charger les événements depuis l'API au montage du composant
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/events');
      const data = await response.json();
      
      // Stocker les événements bruts (sans traitement des récurrences)
      setEvents(data);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    }
  };

  // Mémoïser le traitement des récurrences pour la plage visible uniquement
  const processedEvents = useMemo(() => {
    if (!dateRange.start || !dateRange.end) {
      // Plage par défaut si pas encore définie
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      return processEventsWithRecurrence(events, start, end);
    }
    return processEventsWithRecurrence(events, dateRange.start, dateRange.end);
  }, [events, dateRange]);

  // Gérer le clic sur un événement
  const handleEventClick = (info) => {
    // Vérifier si c'est une occurrence d'un événement récurrent
    if (info.event.extendedProps.isRecurrentOccurrence) {
      setRecurrentDialog({
        isOpen: true,
        event: info.event
      });
      return;
    }

    // Formater les dates pour l'input datetime-local
    const formatDateForInput = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const event = {
      id: info.event.id,
      title: info.event.title,
      description: info.event.extendedProps.description,
      start: formatDateForInput(info.event.start),
      end: formatDateForInput(info.event.end),
      backgroundColor: info.event.backgroundColor,
      type: info.event.extendedProps.type,
      recurrent: info.event.extendedProps.recurrent,
      typeRecurrence: info.event.extendedProps.typeRecurrence,
      dateFinRecurrence: info.event.extendedProps.dateFinRecurrence
    };
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Gérer la sélection d'un créneau (pour créer un événement)
  const handleDateSelect = (selectInfo) => {
    const startDate = new Date(selectInfo.startStr);
    const endDate = new Date(selectInfo.endStr);
    
    // Formater les dates pour l'input datetime-local
    const formatDateForInput = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Calculer la différence en jours entre début et fin
    const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    let finalStart, finalEnd;
    
    if (daysDiff <= 1) {
      // Sélection simple : ajouter 1h à la date de début
      finalStart = startDate;
      finalEnd = new Date(startDate.getTime() + 60 * 60 * 1000); // +1h
    } else {
      // Sélection multiple : garder les dates mais soustraire 1 jour à la fin
      // et copier l'heure de début sur la fin
      finalStart = startDate;
      finalEnd = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // -1 jour
      finalEnd.setHours(startDate.getHours());
      finalEnd.setMinutes(startDate.getMinutes());
    }

    setSelectedDates({
      start: formatDateForInput(finalStart),
      end: formatDateForInput(finalEnd)
    });
    setSelectedEvent(null);
    setIsModalOpen(true);
    selectInfo.view.calendar.unselect();
  };

  const handleSaveEvent = async (eventData) => {
    try {
      if (selectedEvent && selectedEvent.id) {
        // Mode édition
        const response = await fetch(`http://localhost:8000/api/events/${selectedEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData)
        });

        if (response.ok) {
          fetchEvents();
          setIsModalOpen(false);
        }
      } else {
        // Mode création
        const response = await fetch('http://localhost:8000/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData)
        });

        if (response.ok) {
          fetchEvents();
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'événement:', error);
    }
  };

  // Afficher l'événement original d'une occurrence récurrente
  const handleViewOriginalEvent = async () => {
    const originalEventId = recurrentDialog.event.extendedProps.originalEventId;
    setRecurrentDialog({ isOpen: false, event: null });
    
    try {
      const response = await fetch(`http://localhost:8000/api/events/${originalEventId}`);
      const data = await response.json();
      
      const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      
      setSelectedEvent({
        id: data.id,
        title: data.title,
        description: data.description,
        start: formatDateForInput(data.start),
        end: formatDateForInput(data.end),
        type: data.type,
        backgroundColor: data.backgroundColor,
        recurrent: data.recurrent,
        typeRecurrence: data.typeRecurrence,
        dateFinRecurrence: data.dateFinRecurrence
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'événement original:', error);
    }
  };
  // G\u00e9rer la suppression d'un \u00e9v\u00e9nement
  const handleDeleteEvent = (eventId) => {
    setConfirmDialog({ isOpen: true, eventId });
  };

  const confirmDeleteEvent = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/events/${confirmDialog.eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchEvents();
        setIsModalOpen(false);
        setConfirmDialog({ isOpen: false, eventId: null });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'\u00e9v\u00e9nement:', error);
    }
  };
  return (
    <div className="App">
      <div style={{ padding: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
          PJ Agenda - Gestion d'agenda
        </h1>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={processedEvents}
          locale="fr"
          buttonText={{
            today: "Aujourd'hui",
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour'
          }}
          height="auto"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          eventClick={handleEventClick}
          select={handleDateSelect}
          datesSet={(dateInfo) => {
            // Mettre à jour la plage de dates visible
            setDateRange({
              start: dateInfo.start,
              end: dateInfo.end
            });
          }}
        />
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        eventData={selectedEvent}
        startDate={selectedDates.start}
        endDate={selectedDates.end}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Supprimer l'événement"
        message="Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        onConfirm={confirmDeleteEvent}
        onCancel={() => setConfirmDialog({ isOpen: false, eventId: null })}
      />

      <RecurrentEventDialog
        isOpen={recurrentDialog.isOpen}
        eventTitle={recurrentDialog.event?.title || ''}
        onViewOriginal={handleViewOriginalEvent}
        onCancel={() => setRecurrentDialog({ isOpen: false, event: null })}
      />
    </div>
  );
}

export default App;
