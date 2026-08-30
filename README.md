# Hockey Fit Tracker — GitHub Pages + Google Sheets

Persönlicher Fitness-Tracker ohne Server, Supabase oder Vercel.

- **GitHub Pages** liefert die Oberfläche (`index.html`, `styles.css`, `app.js`).
- **Google Sheets** speichert Gewicht, Bauchumfang und Trainingsdaten.
- **Google Apps Script** ist die kleine API zwischen Webseite und Sheet.
- API-URL und privater Token werden **nicht im Repo**, sondern nur im `localStorage` des jeweiligen Browsers gespeichert.

## 1. Google Sheet vorbereiten

1. Erstelle ein neues leeres Google Sheet, z. B. `Hockey Fit Data`.
2. Öffne **Erweiterungen → Apps Script**.
3. Lösche den Beispielcode und kopiere den Inhalt von `backend/Code.gs` hinein.
4. Speichern.
5. Wähle oben die Funktion `setup` und klicke **Ausführen**.
6. Beim ersten Mal die Google-Berechtigungen bestätigen.
7. `setup()` erstellt die Tabs `Weight`, `Measurements` und `Training` und zeigt dir deinen privaten API-Token. **Token kopieren.**

## 2. Apps Script als Web-App veröffentlichen

1. Im Apps-Script-Editor oben rechts **Bereitstellen → Neue Bereitstellung**.
2. Typ: **Web-App**.
3. Ausführen als: **Ich**.
4. Zugriff: **Jeder** (die API selbst ist zusätzlich mit deinem privaten Token geschützt).
5. Bereitstellen und die Web-App-URL kopieren. Sie endet normalerweise auf `/exec`.

Wichtig: Wenn du `Code.gs` später änderst, musst du unter **Bereitstellungen verwalten** eine neue Version der bestehenden Web-App bereitstellen.

## 3. GitHub Pages

1. Neues GitHub-Repository erstellen.
2. Diese Dateien ins Root des Repos laden:
   - `index.html`
   - `styles.css`
   - `app.js`
   - optional `backend/` und diese README
3. GitHub: **Settings → Pages**.
4. Source: **Deploy from a branch**.
5. Branch: `main`, Ordner: `/ (root)`.
6. Speichern. Nach kurzer Zeit zeigt GitHub die Pages-URL an.

## 4. Tracker einmalig verbinden

Beim ersten Öffnen der Seite fragt die App nach:

- Apps-Script-Web-App-URL
- privatem API-Token aus Schritt 1

Beides wird nur im Browser gespeichert. Auf einem zweiten Gerät musst du diese beiden Werte einmal erneut eingeben.

## Eigene Domain

In GitHub unter **Settings → Pages → Custom domain** deine Domain eintragen und den von GitHub angezeigten DNS-Hinweisen folgen.

## Datenstruktur im Sheet

### Weight
`timestamp | date | weight_kg`

### Measurements
`timestamp | date | waist_cm`

### Training
`timestamp | date | type | duration_min | avg_hr | max_hr | rpe | notes`

## Sicherheit

Eine statische GitHub-Pages-Seite kann kein echtes Geheimnis sicher im ausgelieferten JavaScript verstecken. Deshalb ist der Token **nicht im Code** enthalten. Er wird einmal manuell eingegeben und liegt nur im Browser-`localStorage`.

Die Apps-Script-Web-App ist technisch öffentlich erreichbar, akzeptiert aber ohne korrekten Token weder Lese- noch Schreibzugriffe. Behandle den Token wie ein Passwort und committe ihn niemals ins GitHub-Repo.

## Bereits enthalten

- tägliches Gewicht
- 7-Tage-Schnitt
- Wochenvergleich
- Zielgewicht (Default 83 kg)
- Gewichtsgrafik
- Bauchumfang
- Training inkl. Dauer, Ø-Puls, Max-Puls, RPE und Notiz
- dein Start-Wochenplan im Dashboard
- responsive/mobile Oberfläche

## Sinnvolle nächste Ausbaustufe

- Kraft A/B mit einzelnen Übungen, Sätzen, Wiederholungen und Gewichten
- automatische Progression
- Zone-2-Zielpuls aus deinen echten Belastungsdaten
- Schritte pro Tag
- Trainings-/Gewichtstrends über 4/12 Wochen
- Datenexport
