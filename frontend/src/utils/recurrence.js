// Fonction pour générer les occurrences récurrentes d'un événement dans une plage de dates
export const generateRecurrentEvents = (event, rangeStart = null, rangeEnd = null) => {
  if (!event.recurrent || !event.typeRecurrence || !event.dateFinRecurrence) {
    return [event];
  }

  const occurrences = [];
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const endRecurrence = new Date(event.dateFinRecurrence);
  
  // Définir une plage de dates visible (par défaut: -1 mois à +2 mois)
  const viewStart = rangeStart ? new Date(rangeStart) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const viewEnd = rangeEnd ? new Date(rangeEnd) : new Date(new Date().setMonth(new Date().getMonth() + 2));
  
  // Durée de l'événement en millisecondes
  const eventDuration = endDate - startDate;
  
  // Ajouter l'événement original si dans la plage visible
  if (startDate >= viewStart && startDate <= viewEnd) {
    occurrences.push(event);
  }
  
  // Calculer la date de la prochaine occurrence (pas la première)
  let currentDate = new Date(startDate);
  
  // Calculer la première occurrence suivante selon le type de récurrence
  switch (event.typeRecurrence) {
    case 'quotidienne':
      currentDate.setDate(currentDate.getDate() + 1);
      break;
    case 'hebdomadaire':
      currentDate.setDate(currentDate.getDate() + 7);
      break;
    case 'mensuelle':
      currentDate.setMonth(currentDate.getMonth() + 1);
      break;
    default:
      return [event]; // Type inconnu, retourner l'événement original
  }
  
  // Limiter le calcul à la fin de récurrence ET à la plage visible
  const effectiveEndDate = endRecurrence < viewEnd ? endRecurrence : viewEnd;
  let count = 1;
  
  while (currentDate <= effectiveEndDate) {
    // Créer une occurrence seulement si dans la plage visible
    if (currentDate >= viewStart) {
      const occurrenceStart = new Date(currentDate);
      const occurrenceEnd = new Date(currentDate.getTime() + eventDuration);
      
      occurrences.push({
        ...event,
        id: `${event.id}_occ_${count}`,
        start: occurrenceStart.toISOString(),
        end: occurrenceEnd.toISOString(),
        isRecurrentOccurrence: true,
        originalEventId: event.id
      });
    }
    
    // Calculer la prochaine date selon le type de récurrence
    switch (event.typeRecurrence) {
      case 'quotidienne':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'hebdomadaire':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'mensuelle':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
    }
    
    count++;
  }
  
  return occurrences;
};

// Fonction pour traiter tous les événements et générer les occurrences récurrentes
export const processEventsWithRecurrence = (events) => {
  const allEvents = [];
  
  events.forEach(event => {
    if (event.recurrent) {
      // Générer toutes les occurrences de cet événement récurrent
      const occurrences = generateRecurrentEvents(event);
      allEvents.push(...occurrences);
    } else {
      // Événement simple, l'ajouter tel quel
      allEvents.push(event);
    }
  });
  
  return allEvents;
};
