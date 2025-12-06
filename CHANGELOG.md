# Changelog

Tutte le modifiche notevoli a questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), e questo progetto aderisce al [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.22.0] - 2025-12-07
### Architettura
- **Farmacia Virtuale (Magazzino) 🏥**: 
  - Separazione strutturale tra "Programmazione Assunzioni" e "Inventario Fisico".
  - Introdotta la tabella `inventory` su Supabase.
  - Più schemi di assunzione (es. Paolo Mattina + Barbara Sera) possono ora attingere dallo stesso prodotto fisico (Prodotto Collegato), garantendo una sincronizzazione perfetta delle scorte senza duplicazioni.

### Funzionalità
- **Setup Esclusivo per Paolo 🔐**: 
  - Il tab "Setup" è ora nascosto per il profilo Barbara.
  - Paolo ha accesso alla gestione centralizzata di tutti i medicinali (sia propri che di Barbara) in un'unica schermata.
  - Reindirizzamento di sicurezza: se si cambia utente mentre si è nelle impostazioni, l'app torna automaticamente alla home.
- **Rifornimento Rapido (Smart Refill) ⚡**: 
  - Aggiunto pulsante `+` nel pannello di modifica scorte.
  - Permette di aggiungere la quantità di una nuova confezione (es. +60) alla scorta residua senza dover fare calcoli a mente.

## [1.21.0] - 2025-12-06
### Aggiunto
- **Notifiche Push Locali 🔔**:
  - Implementato sistema di notifica nativo del browser (Desktop/Mobile).
  - L'utente riceve un avviso immediato se, assumendo un farmaco, la scorta scende sotto la soglia impostata (stockThreshold).
  - Richiesta permessi automatica all'avvio dell'applicazione.

## [1.20.0] - 2025-12-06
### Migliorato
- **Ordinamento Cronologico Intelligente**: La lista dei medicinali "Oggi" e dello "Storico" ora viene ordinata automaticamente in base al momento dell'assunzione durante la giornata, migliorando la leggibilità del piano terapeutico.
  - Priorità: Colazione → Mattina → Pomeriggio → Lontano dai pasti → Entro le 17:00 → Sera.

## [1.19.1] - 2025-12-06
### Corretto
- **Sovrapposizione Header**: Risolto un problema grafico (z-index) per cui la lista dei medicinali scorreva sopra il banner dell'intestazione. Ora l'intestazione e i selettori utente rimangono correttamente sempre in primo piano durante lo scorrimento.

## [1.19.0] - 2025-12-05
### Aggiunto
- **Smart Login (Rilevamento OS)**:
  - L'app ora riconosce automaticamente il dispositivo utilizzato.
  - Se rileva **Android**, seleziona automaticamente il profilo di **Barbara**.
  - Se rileva **iOS (iPhone/iPad)**, seleziona automaticamente il profilo di **Paolo**.
  - Le scorciatoie dell'app (Home Screen Shortcuts) hanno ancora la priorità su questo automatismo.

## [1.18.0] - 2025-12-05
### Migliorato
- **Organizzazione Impostazioni 📂**:
  - Implementato il raggruppamento visivo per i medicinali con lo stesso nome.
  - Se un farmaco viene assunto più volte al giorno (es. Mattina e Sera), ora appare come una singola voce espandibile.
  - Riduce drasticamente la lunghezza della lista e migliora la leggibilità generale della sezione Setup.

## [1.17.0] - 2025-12-05
### Aggiunto
- **Scorta Condivisa 🤝**:
  - Nuova funzionalità per sincronizzare la quantità di un medicinale tra Paolo e Barbara.
  - Utile quando entrambi attingono dalla stessa confezione (es. Uncaria).
  - Attivabile dal pannello di modifica selezionando "Scorta Condivisa".

### Migliorato
- **Impostazioni Personali**: La sezione Impostazioni ora mostra solo i medicinali dell'utente correntemente selezionato, riducendo la confusione e migliorando l'organizzazione.

## [1.16.0] - 2025-12-03
### Aggiunto
- **Archiviazione/Sospensione Terapia ⏸️**:
  - Nuova opzione nel pannello di modifica per "Sospendere la Terapia".
  - I farmaci sospesi scompaiono dalla lista giornaliera e dalla lista spesa, ma non vengono eliminati.
  - Sezione "Farmaci Sospesi" separata nelle Impostazioni per riattivarli facilmente in futuro.
  - Ideale per terapie cicliche (es. Enterogermina) o integratori a rotazione.

## [1.15.0] - 2025-12-03
### Aggiunto
- **Dark Mode Automatica 🌙**: 
  - L'app ora si adatta automaticamente alle impostazioni di sistema (tema chiaro/scuro).
  - Sfondi scuri rilassanti (grigio scuro/nero) per ridurre l'affaticamento degli occhi nelle ore serali.
  - Testi, icone e bordi ottimizzati per il massimo contrasto e leggibilità in modalità notturna.
  - La barra di stato del browser si adatta al tema.

## [1.14.0] - 2025-12-03
### Aggiunto
- **Lista della Spesa Automatica 🛒**: 
  - Nuova icona "Carrello" nella sezione Impostazioni con badge di notifica per i farmaci in esaurimento.
  - Generazione automatica della lista dei medicinali sotto soglia.
  - Pulsante **"Invia WA"** che pre-compila un messaggio WhatsApp per il partner con la lista di cose da comprare.

## [1.13.1] - 2025-12-03
### Corretto
- **Avatar Rotti**: Risolto problema con l'URL dell'API DiceBear che causava la visualizzazione di un punto interrogativo per entrambi gli avatar. Aggiornati i nomi dei parametri `top` (`shortFlat`, `curvy`) per compatibilità con la versione v9 dell'API.

## [1.13.0] - 2025-12-03
### Corretto
- **Avatar Utenti**: Risolto un bug che mostrava un'immagine segnaposto (punto interrogativo) per Paolo. Aggiornati i parametri delle API DiceBear per garantire la corretta visualizzazione delle caricature per entrambi gli utenti.

### Rimosso
- **Feedback Sonoro**: Rimossa la funzionalità che riproduceva un suono al completamento del 100% degli obiettivi, su richiesta.

## [1.12.0] - 2025-12-03
### Aggiunto
- **Vista Calendario Mensile**: La sezione "Storico" ora mostra un calendario mensile completo invece della striscia di 14 giorni.
  - Navigazione tra i mesi.
  - Indicatori visivi a "pallino": Verde (Completo), Giallo (Parziale), Rosso (Saltato), Grigio (Futuro/Nessun piano).
  - Dettaglio giornaliero interattivo al tocco.

## [1.11.0] - 2025-12-03
### Aggiunto
- **Gestione Scorte (Inventory Tracking)**: 
  - Possibilità di impostare una quantità iniziale e una soglia di avviso per ogni medicinale.
  - La quantità diminuisce automaticamente quando si assume il farmaco e aumenta se si annulla l'assunzione.
  - **Indicatori Visivi**: Badge arancione "Rimasti: X" nella card del farmaco quando si scende sotto la soglia.
  - Sezione dedicata nelle Impostazioni per vedere rapidamente le giacenze.
  - Necessita aggiornamento schema database (vedi README).

## [1.10.0] - 2025-12-03
### Aggiunto
- **Feedback Sonoro**: Aggiunto un effetto sonoro ("Chime" di successo) che viene riprodotto automaticamente quando si completa il 100% dei farmaci giornalieri, aumentando la gratificazione dell'utente. Il suono funziona offline.

## [1.9.0] - 2025-12-03
### Aggiunto
- **Celebrazione Obiettivo**: Nuova esperienza di completamento giornaliero. Quando tutti i farmaci previsti sono stati assunti (100%), la barra di progresso si trasforma in un banner celebrativo prominente.
- **Effetto Coriandoli**: Aggiunta animazione particellare (Confetti) che esplode sullo schermo per gratificare l'utente al completamento della terapia.
- **Micro-interazioni**: Animazioni migliorate per l'icona "Trofeo" e transizioni più fluide.

## [1.8.0] - 2025-12-03
### Migliorato
- **Vista Storico Intelligente**: Ora lo storico distingue tra giorni passati e il giorno corrente. Se si visualizza la data di "Oggi", i farmaci non ancora presi appaiono come "Da prendere" (grigio/neutro) con icona orologio, invece che come "Saltato" (rosso), riflettendo correttamente che la giornata non è ancora conclusa.

## [1.7.0] - 2024-12-01
### Aggiunto
- **Feedback Visivo**: Nuova animazione "pop" sulla spunta e flash verde sullo sfondo quando si prende un farmaco per un feedback positivo immediato.
- **Ordinamento Alfabetico**: Aggiunto pulsante nelle Impostazioni per ordinare la lista farmaci per nome (A-Z).

### Modificato
- **UI Card Medicinali**: Ridisegnata la MedicationCard per una maggiore chiarezza:
    - Aggiunta barra laterale colorata (Accent Bar) per i farmaci ancora da prendere.
    - Le note importanti ora appaiono in un box giallo evidenziato per attirare l'attenzione.
    - Stile più pulito, piatto e trasparente per i farmaci già assunti ("Archiviati").

## [1.6.0] - 2024-12-01
### Aggiunto
- **PWA App Shortcuts**: Aggiunte scorciatoie nel `manifest.json` per accedere direttamente al profilo di Paolo o Barbara tenendo premuta l'icona dell'app.
- **Deep Linking**: Gestione dei parametri URL `?user=nome` all'avvio dell'app.

### Modificato
- **Logica Turni Alterni**: Risolto bug sul calcolo della percentuale di completamento. Introdotta distinzione tra `Turno A` (Pari) e `Turno B` (Dispari). I farmaci non previsti oggi vengono ora nascosti dalla vista "Oggi" invece di apparire come non presi.
- **Interfaccia Modifica**: Il selettore di frequenza ora indica esplicitamente se il turno alterno inizia "Oggi" o "Domani".

## [1.5.0] - 2024-12-01
### Aggiunto
- **Deploy Cloud Run**: Aggiunti `Dockerfile` e `nginx.conf` per il deployment containerizzato su Google Cloud.
- **Supporto Bustine**: Aggiunta nuova icona "Sachet" (Bustina) per medicinali in polvere (es. Retigan, Zetavit).

### Corretto
- Corretti i meta-tag iOS in `index.html` per garantire la visualizzazione full-screen corretta.

## [1.4.0] - 2024-12-01
### Aggiunto
- **Sezione Impostazioni**: Nuova vista dedicata per la gestione dell'inventario farmaci.
- **CRUD Completo**: Possibilità di Aggiungere ed Eliminare medicinali direttamente dall'app.
- **Modale Modifica Avanzato**: Refactoring del form di modifica per supportare tutte le proprietà (nome, dosaggio, orario, icona, frequenza).

## [1.3.0] - 2024-12-01
### Aggiunto
- **Configurazione Cloud Automatica**: Rimossa la schermata di login manuale. Le credenziali Supabase sono ora integrate (`constants.tsx`) per un avvio immediato (Zero-Config).

## [1.2.0] - 2024-12-01
### Aggiunto
- **Vista Storico**: Implementata la visualizzazione `HistoryView` con strip calendario degli ultimi 14 giorni.
- **Statistiche Giornaliere**: Calcolo percentuale aderenza terapia per i giorni passati.
- **Bottom Navigation**: Barra di navigazione inferiore per spostarsi tra Oggi, Storico e Setup.

## [1.1.0] - 2024-12-01
### Aggiunto
- **Integrazione Supabase**: Migrazione da LocalStorage a database cloud Supabase per sincronizzazione tra dispositivi.
- **Realtime**: Aggiornamento istantaneo dell'interfaccia quando il partner spunta un farmaco.

## [1.0.0] - 2024-12-01
### Rilascio Iniziale
- Gestione profili Paolo e Barbara.
- Lista medicinali giornaliera.
- Check-in (Preso/Non preso).
- Pulsante promemoria WhatsApp.
- Persistenza dati locale.