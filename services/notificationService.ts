
export const requestNotificationPermission = async (): Promise<boolean> => {
  // Verifica preliminare: se l'API non esiste (es. iOS < 16.4 o non installato in Home), esci silenziosamente.
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('Web Notifications API non supportata su questo dispositivo/browser.');
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  } catch (e) {
    console.error('Errore durante la richiesta permessi notifica:', e);
  }

  return false;
};

export const sendStockNotification = (medName: string, remaining: number) => {
  try {
    // Doppia verifica per sicurezza prima di invocare Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const title = `⚠️ Scorta in esaurimento: ${medName}`;
      const options: any = {
        body: `Ne restano solo ${remaining}. Aggiungilo alla lista della spesa!`,
        icon: 'https://img.icons8.com/color/192/pill.png',
        badge: 'https://img.icons8.com/color/96/pill.png',
        tag: 'low-stock-' + medName,
        renotify: true,
        requireInteraction: false
      };

      // Tenta di usare il ServiceWorker se disponibile e attivo (migliore per Android/PWA)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, options).catch(err => {
             // Fallback se showNotification fallisce
             new Notification(title, options);
          });
        });
      } else {
        // Fallback standard (Desktop / iOS PWA senza SW complesso)
        new Notification(title, options);
      }
    }
  } catch (e) {
    console.error('Errore invio notifica:', e);
  }
};
