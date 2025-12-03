# Changelog

Tutte le modifiche notevoli a questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), e questo progetto aderisce al [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
