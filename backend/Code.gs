/**
 * Hockey Fit Tracker – Google Sheets Backend
 * Version: 0.4
 */

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Bitte dieses Script aus einem Google Sheet heraus starten.');

  const schemas = {
    Weight: ['timestamp','date','weight_kg'],
    Measurements: ['timestamp','date','waist_cm'],
    Training: ['timestamp','date','type','duration_min','avg_hr','max_hr','rpe','device','level','calories','warmup_minutes','warmup_level','warmup_calories','notes'],
    Exercises: ['timestamp','date','training_type','exercise_order','exercise','sets','reps','weight_min_kg','weight_max_kg','notes']
  };

  Object.keys(schemas).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    const wanted = schemas[name];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(wanted);
    } else {
      const lastCol = Math.max(1, sheet.getLastColumn());
      const current = sheet.getRange(1,1,1,lastCol).getValues()[0].map(String);
      wanted.forEach(header => {
        if (!current.includes(header)) {
          sheet.getRange(1, current.length + 1).setValue(header);
          current.push(header);
        }
      });
    }
    sheet.setFrozenRows(1);
  });

  const props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', ss.getId());
  let token = props.getProperty('API_TOKEN');
  if (!token) {
    token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
    props.setProperty('API_TOKEN', token);
  }

  console.log('---------------------------------------');
  console.log('HOCKEY FIT TRACKER EINGERICHTET');
  console.log('API_TOKEN: ' + token);
  console.log('---------------------------------------');
}

function doGet(e) {
  try {
    assertToken_(e.parameter.token);
    const action = e.parameter.action || 'all';
    let result;
    if (action === 'ping') result = {ok:true,message:'connected'};
    else if (action === 'all') result = {ok:true,data:readAll_()};
    else result = {ok:false,error:'Unbekannte Aktion'};
    return output_(result,e.parameter.callback);
  } catch (err) {
    return output_({ok:false,error:String(err.message || err)},e.parameter.callback);
  }
}

function doPost(e) {
  try {
    assertToken_(e.parameter.token);
    const action = e.parameter.action;
    const payload = JSON.parse(e.parameter.payload || '{}');
    if (action === 'addWeight') addWeight_(payload);
    else if (action === 'addMeasurement') addMeasurement_(payload);
    else if (action === 'addTraining') addTraining_(payload);
    else if (action === 'addExercise') addExercise_(payload);
    else throw new Error('Unbekannte Aktion');
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err.message || err)})).setMimeType(ContentService.MimeType.JSON);
  }
}

function assertToken_(token) {
  const expected = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
  if (!expected || !token || token !== expected) throw new Error('Nicht autorisiert');
}

function ss_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Backend ist noch nicht eingerichtet. Bitte setup() ausführen.');
  return SpreadsheetApp.openById(id);
}

function addWeight_(p) {
  if (!p.date || !isFinite(Number(p.weight_kg))) throw new Error('Ungültige Gewichtsdaten');
  ss_().getSheetByName('Weight').appendRow([new Date(),safeDate_(p.date),Number(p.weight_kg)]);
}

function addMeasurement_(p) {
  if (!p.date || !isFinite(Number(p.waist_cm))) throw new Error('Ungültige Messdaten');
  ss_().getSheetByName('Measurements').appendRow([new Date(),safeDate_(p.date),Number(p.waist_cm)]);
}

function addTraining_(p) {
  if (!p.date || !p.type || !isFinite(Number(p.duration_min))) throw new Error('Ungültige Trainingsdaten');
  appendByHeader_('Training', {
    timestamp: new Date(),
    date: safeDate_(p.date),
    type: String(p.type),
    duration_min: Number(p.duration_min),
    avg_hr: numOrBlank_(p.avg_hr),
    max_hr: numOrBlank_(p.max_hr),
    rpe: numOrBlank_(p.rpe),
    device: String(p.device || ''),
    level: numOrBlank_(p.level),
    calories: numOrBlank_(p.calories),
    warmup_minutes: numOrBlank_(p.warmup_minutes),
    warmup_level: numOrBlank_(p.warmup_level),
    warmup_calories: numOrBlank_(p.warmup_calories),
    notes: String(p.notes || '')
  });
}

function addExercise_(p) {
  if (!p.date || !p.training_type || !p.exercise) throw new Error('Ungültige Übungsdaten');
  ss_().getSheetByName('Exercises').appendRow([
    new Date(),safeDate_(p.date),String(p.training_type),numOrBlank_(p.exercise_order),String(p.exercise),
    numOrBlank_(p.sets),numOrBlank_(p.reps),numOrBlank_(p.weight_min_kg),numOrBlank_(p.weight_max_kg),String(p.notes || '')
  ]);
}


function appendByHeader_(sheetName, values) {
  const sheet = ss_().getSheetByName(sheetName);
  if (!sheet) throw new Error('Tabelle fehlt: ' + sheetName);
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0].map(String);
  sheet.appendRow(headers.map(h => Object.prototype.hasOwnProperty.call(values,h) ? values[h] : ''));
}

function readAll_() {
  return {
    weights: readSheet_('Weight'),
    measurements: readSheet_('Measurements'),
    training: readSheet_('Training'),
    exercises: readSheet_('Exercises')
  };
}

function readSheet_(name) {
  const sheet = ss_().getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values.map(row => {
    const object = {};
    headers.forEach((header,i) => {
      let value = row[i];
      if (header === 'date' && value instanceof Date) value = Utilities.formatDate(value,Session.getScriptTimeZone(),'yyyy-MM-dd');
      if (header === 'timestamp' && value instanceof Date) value = value.toISOString();
      object[header] = value;
    });
    return object;
  });
}

function safeDate_(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) throw new Error('Ungültiges Datum');
  return String(value);
}

function numOrBlank_(value) {
  if (value === '' || value === null || typeof value === 'undefined') return '';
  const n = Number(value);
  return isFinite(n) ? n : '';
}

function output_(object,callback) {
  const json = JSON.stringify(object);
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback+'('+json+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
