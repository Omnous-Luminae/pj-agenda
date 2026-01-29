import React, { useState, useEffect, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import ConfirmDialog from './ConfirmDialog';
import RecurrentEventDialog from './RecurrentEventDialog';
import { processEventsWithRecurrence } from './utils/recurrence';

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDates, setSelectedDates] = useState({ start: '', end: '' });
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const calendarRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, eventId: null });
  const [recurrentDialog, setRecurrentDialog] = useState({ isOpen: false, event: null });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    }
  };

  const processedEvents = useMemo(() => {
    if (!dateRange.start || !dateRange.end) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      return processEventsWithRecurrence(events, start, end);
    }
    return processEventsWithRecurrence(events, dateRange.start, dateRange.end);
  }, [events, dateRange]);

  const handleEventClick = (info) => {
    if (info.event.extendedProps.isRecurrentOccurrence) {
      setRecurrentDialog({
        isOpen: true,
        event: info.event
      });
      return;
    }

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

  const handleDateSelect = (selectInfo) => {
    const startDate = new Date(selectInfo.startStr);
    const endDate = new Date(selectInfo.endStr);
    
    const formatDateForInput = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const daysDiff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    let finalStart, finalEnd;
    
    if (daysDiff <= 1) {
      finalStart = startDate;
      finalEnd = new Date(startDate.getTime() + 60 * 60 * 1000);
    } else {
      finalStart = startDate;
      finalEnd = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
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
      console.error('Erreur lors de la suppression de l\'événement:', error);
    }
  };

  const handleEventDrop = async (info) => {
    const event = info.event;
    
    if (event.extendedProps.isRecurring && !event.extendedProps.isOriginal) {
      info.revert();
      setRecurrentDialog({ 
        isOpen: true, 
        event: { ...event.extendedProps, title: event.title } 
      });
      return;
    }

    // Fonction pour formater la date sans conversion UTC
    const formatLocalDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const updatedEvent = {
      title: event.title,
      description: event.extendedProps.description || '',
      start: formatLocalDateTime(event.start),
      end: event.end ? formatLocalDateTime(event.end) : formatLocalDateTime(event.start),
      type: event.extendedProps.type || '',
      backgroundColor: event.backgroundColor || '#3788d8',
      recurrent: event.extendedProps.recurrent || false,
      typeRecurrence: event.extendedProps.typeRecurrence || null,
      dateFinRecurrence: event.extendedProps.dateFinRecurrence || null
    };

    try {
      const response = await fetch(`http://localhost:8000/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent)
      });
      
      if (!response.ok) {
        info.revert();
        console.error('Erreur HTTP:', response.status);
        alert('Erreur lors du déplacement de l\'événement');
        return;
      }
      
      await fetchEvents();
    } catch (error) {
      console.error('Erreur:', error);
      info.revert();
      alert('Erreur lors du déplacement de l\'événement');
    }
  };

  const handleEventResize = async (info) => {
    const event = info.event;
    
    if (event.extendedProps.isRecurring && !event.extendedProps.isOriginal) {
      info.revert();
      setRecurrentDialog({ 
        isOpen: true, 
        event: { ...event.extendedProps, title: event.title } 
      });
      return;
    }

    // Fonction pour formater la date sans conversion UTC
    const formatLocalDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const updatedEvent = {
      title: event.title,
      description: event.extendedProps.description || '',
      start: formatLocalDateTime(event.start),
      end: event.end ? formatLocalDateTime(event.end) : formatLocalDateTime(event.start),
      type: event.extendedProps.type || '',
      backgroundColor: event.backgroundColor || '#3788d8',
      recurrent: event.extendedProps.recurrent || false,
      typeRecurrence: event.extendedProps.typeRecurrence || null,
      dateFinRecurrence: event.extendedProps.dateFinRecurrence || null
    };

    try {
      const response = await fetch(`http://localhost:8000/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent)
      });
      
      if (!response.ok) {
        info.revert();
        console.error('Erreur HTTP:', response.status);
        alert('Erreur lors du redimensionnement de l\'événement');
        return;
      }
      
      await fetchEvents();
    } catch (error) {
      console.error('Erreur:', error);
      info.revert();
      alert('Erreur lors du redimensionnement de l\'événement');
    }
  };

  return (
    <div>
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
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        datesSet={(dateInfo) => {
          setDateRange({
            start: dateInfo.start,
            end: dateInfo.end
          });
        }}
      />

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

export default CalendarPage;
