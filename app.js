const state = {
  data: { weights: [], measurements: [], training: [], exercises: [] },
  workout: null
};

const $ = (id) => document.getElementById(id);
const today = () => new Date().toISOString().slice(0,10);

const workoutPlans = {
  'Kraft A': [
    { name:'Bankdrücken Multipower', sets:3, reps:10, help:'Bank flach stellen. Stange ungefähr über der Brust. Schulterblätter leicht nach hinten/unten, Füsse fest auf den Boden. Stange kontrolliert zur Brust senken und hochdrücken.' },
    { name:'Latziehen Kabelzug', sets:3, reps:10, help:'Breite Stange am oberen Kabel. Brust leicht raus, Ellbogen nach unten ziehen. Stange zur oberen Brust, nicht hinter den Kopf. Langsam zurück.' },
    { name:'Goblet Squat', sets:3, reps:10, help:'Eine Kurzhantel vor der Brust halten. Füsse etwa schulterbreit. Hüfte nach unten/hinten, Knie folgen den Fussspitzen. Fersen bleiben am Boden.' },
    { name:'Rudern Kabelzug', sets:3, reps:10, help:'Griff auf Bauch-/Brusthöhe. Stabil sitzen oder stehen. Griff zum Bauch ziehen, Schulterblätter hinten zusammen. Oberkörper bleibt ruhig.' },
    { name:'Schulterdrücken Kurzhanteln', sets:3, reps:10, help:'Bank auf ca. 70–80°. Hanteln auf Schulterhöhe starten. Nach oben drücken, ohne stark ins Hohlkreuz zu gehen. Kontrolliert absenken.' }
  ],
  'Kraft B': [
    { name:'Rumänisches Kreuzheben Kurzhanteln', sets:3, reps:10, help:'Hanteln vor den Oberschenkeln. Knie leicht gebeugt. Hüfte nach hinten schieben, Rücken neutral, Hanteln nah an den Beinen. Nur so tief, wie der Rücken stabil bleibt.' },
    { name:'Brustdrücken Kurzhanteln', sets:3, reps:10, help:'Flach auf die Bank. Hanteln seitlich über der Brust. Schulterblätter leicht nach hinten/unten. Hochdrücken und kontrolliert wieder absenken.' },
    { name:'Latziehen enger Griff', sets:3, reps:10, help:'Engen oder neutralen Griff oben am Kabelzug. Brust aufrecht. Ellbogen Richtung Hüfte ziehen und langsam wieder strecken.' },
    { name:'Ausfallschritte / Split Squat', sets:3, reps:8, help:'Ein Bein vor, eines zurück. Oberkörper aufrecht. Hinteres Knie kontrolliert Richtung Boden. Erst ohne Gewicht starten; Wiederholungen gelten pro Seite.' },
    { name:'Face Pull Kabelzug', sets:2, reps:15, help:'Seil ungefähr auf Gesichtshöhe. Zum Gesicht ziehen, Ellbogen nach aussen, Schulterblätter zusammen. Leichtes Gewicht und saubere Bewegung.' }
  ]
};

function config(){ return { url: localStorage.getItem('hf_api_url') || '', token: localStorage.getItem('hf_api_token') || '' }; }
function hasConfig(){ const c=config(); return c.url && c.token; }
function setStatus(id,msg,type=''){ const e=$(id); e.textContent=msg; e.className='status '+type; }
function esc(s=''){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function num(v,d=1){ const n=Number(v); return Number.isFinite(n)?n.toFixed(d):'—'; }
function isStrength(type){ return !!workoutPlans[type]; }

function jsonp(action='all', extra={}){
  return new Promise((resolve,reject)=>{
    const c=config();
    if(!c.url || !c.token) return reject(new Error('Verbindung nicht eingerichtet'));
    const cb='hfcb_'+Date.now()+'_'+Math.random().toString(36).slice(2);
    const params=new URLSearchParams({action,token:c.token,callback:cb,...extra});
    const script=document.createElement('script');
    const timer=setTimeout(()=>cleanup(new Error('Zeitüberschreitung beim Google Sheet')),12000);
    function cleanup(err,data){clearTimeout(timer);delete window[cb];script.remove();err?reject(err):resolve(data);}
    window[cb]=(data)=>{ if(data && data.ok===false) cleanup(new Error(data.error||'API Fehler')); else cleanup(null,data); };
    script.onerror=()=>cleanup(new Error('Google Apps Script nicht erreichbar'));
    script.src=c.url+'?'+params.toString();
    document.body.appendChild(script);
  });
}

function post(action,payload){
  const c=config();
  const form=document.createElement('form');
  form.method='POST'; form.action=c.url; form.target='writeSink'; form.style.display='none';
  const fields={action,token:c.token,payload:JSON.stringify(payload)};
  Object.entries(fields).forEach(([k,v])=>{const i=document.createElement('input');i.type='hidden';i.name=k;i.value=v;form.appendChild(i)});
  document.body.appendChild(form); form.submit(); form.remove();
}

async function loadData(){
  if(!hasConfig()) return showSetup();
  try{
    const res=await jsonp('all');
    state.data={...state.data,...(res.data||{})};
    renderAll();
  }catch(e){ console.error(e); }
}

function sorted(arr){return [...arr].sort((a,b)=>String(a.date).localeCompare(String(b.date)));}
function last(arr){const s=sorted(arr);return s[s.length-1];}
function avg(arr){return arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:null;}

function renderAll(){
  const w=sorted(state.data.weights||[]);
  const m=sorted(state.data.measurements||[]);
  const t=sorted(state.data.training||[]);
  const cur=last(w); const goal=Number(localStorage.getItem('hf_goal')||83);
  $('goalWeight').textContent=goal.toFixed(1); $('goalInput').value=goal;
  $('currentWeight').textContent=cur?num(cur.weight_kg):'—';
  const last7=w.slice(-7).map(x=>Number(x.weight_kg)).filter(Number.isFinite);
  $('avg7').textContent=last7.length?num(avg(last7)):'—';
  $('toGoal').textContent=cur?num(Math.max(0,Number(cur.weight_kg)-goal)):'—';
  if(w.length>=8){
    const recent=avg(w.slice(-7).map(x=>Number(x.weight_kg)));
    const prev=avg(w.slice(-14,-7).map(x=>Number(x.weight_kg)));
    $('trend7').textContent=num(recent-prev);
  } else $('trend7').textContent='—';
  $('currentWaist').textContent=last(m)?num(last(m).waist_cm):'—';
  renderWeightChart(w.slice(-30));
  $('weightList').innerHTML=w.slice(-12).reverse().map(x=>`<div class="list-row"><div><strong>${esc(x.date)}</strong><small>Morgengewicht</small></div><div class="right"><strong>${num(x.weight_kg)} kg</strong></div></div>`).join('')||'<p class="muted">Noch keine Einträge.</p>';
  $('waistList').innerHTML=m.slice(-12).reverse().map(x=>`<div class="list-row"><div><strong>${esc(x.date)}</strong></div><div class="right"><strong>${num(x.waist_cm)} cm</strong></div></div>`).join('')||'<p class="muted">Noch keine Einträge.</p>';
  $('trainingList').innerHTML=t.slice(-12).reverse().map(x=>`<div class="list-row"><div><strong>${esc(x.type)}</strong><small>${esc(x.date)} · ${esc(x.duration_min)} min${x.rpe?' · RPE '+esc(x.rpe):''}</small></div><div class="right"><strong>${x.avg_hr?esc(x.avg_hr)+' Ø':'—'}</strong><small>${x.max_hr?'max '+esc(x.max_hr):''}</small></div></div>`).join('')||'<p class="muted">Noch keine Trainings.</p>';
}

function renderWeightChart(rows){
  const svg=$('weightChart'); if(!rows.length){svg.innerHTML='<text x="300" y="110" text-anchor="middle" class="axis-label">Noch keine Gewichtsdaten</text>';return;}
  const vals=rows.map(x=>Number(x.weight_kg)); let min=Math.min(...vals),max=Math.max(...vals); if(max-min<2){min-=1;max+=1}else{min-=.5;max+=.5;}
  const W=600,H=220,padX=38,padY=20; const x=i=>padX+(i/(Math.max(1,rows.length-1)))*(W-padX*2); const y=v=>padY+(max-v)/(max-min)*(H-padY*2);
  let grid=''; for(let i=0;i<4;i++){const yy=padY+i*(H-padY*2)/3;const val=max-i*(max-min)/3;grid+=`<line x1="${padX}" y1="${yy}" x2="${W-padX}" y2="${yy}" class="gridline"/><text x="2" y="${yy+5}" class="axis-label">${val.toFixed(1)}</text>`;}
  const pts=rows.map((r,i)=>`${x(i)},${y(Number(r.weight_kg))}`).join(' '); const area=`${x(0)},${H-padY} ${pts} ${x(rows.length-1)},${H-padY}`;
  svg.innerHTML=grid+`<polygon points="${area}" class="chart-area"/><polyline points="${pts}" class="chart-line"/>`+rows.map((r,i)=>`<circle cx="${x(i)}" cy="${y(Number(r.weight_kg))}" r="3.5" class="chart-dot"/>`).join('');
}

function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('hidden',v.id!==id));
  document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  const names={dashboardView:'Dashboard',weightView:'Gewicht',trainingView:'Training',bodyView:'Bauchumfang',settingsView:'Einstellungen',setupView:'Setup'};
  $('pageTitle').textContent=names[id]||'Hockey Fit';
  if(id==='trainingView' && !state.workout) resetTrainingWizard();
}
function showSetup(){ $('apiUrl').value=config().url; $('apiToken').value=config().token; showView('setupView'); }

async function saveAndRefresh(action,payload,statusId){
  try{ setStatus(statusId,'Speichere …'); post(action,payload); await new Promise(r=>setTimeout(r,1300)); await loadData(); setStatus(statusId,'Gespeichert ✓','ok'); }
  catch(e){setStatus(statusId,e.message,'err');}
}

function hideTrainingCards(){
  ['trainingStartCard','exerciseWizardCard','trainingFinishCard'].forEach(id=>$(id).classList.add('hidden'));
}

function resetTrainingWizard(){
  state.workout=null;
  hideTrainingCards();
  $('trainingStartCard').classList.remove('hidden');
  $('trainingDate').value=today();
  $('durationMin').value=''; $('rpe').value=''; $('avgHr').value=''; $('maxHr').value=''; $('trainingNotes').value='';
  setStatus('trainingStatus','');
}

function startTrainingWizard(){
  const type=$('trainingType').value;
  const date=$('trainingDate').value || today();
  state.workout={ date, type, exerciseIndex:0, exercises:[] };
  hideTrainingCards();
  if(isStrength(type)){
    state.workout.exercises=workoutPlans[type].map(e=>({ ...e, weight_min_kg:'', weight_max_kg:'', notes:'' }));
    $('exerciseWizardCard').classList.remove('hidden');
    renderExerciseStep();
  } else {
    $('trainingFinishCard').classList.remove('hidden');
    $('finishTitle').textContent=type+' abschliessen';
    $('finishStepLabel').textContent='SCHRITT 2';
    $('exerciseSummary').classList.add('hidden');
    $('finishBackBtn').textContent='← Zurück';
  }
}

function saveCurrentExerciseFields(){
  if(!state.workout || !isStrength(state.workout.type)) return;
  const e=state.workout.exercises[state.workout.exerciseIndex];
  e.sets=Number($('exerciseSets').value)||e.sets;
  e.reps=Number($('exerciseReps').value)||e.reps;
  e.weight_min_kg=$('exerciseWeightMin').value;
  e.weight_max_kg=$('exerciseWeightMax').value;
  e.notes=$('exerciseNotes').value.trim();
}

function renderExerciseStep(){
  const w=state.workout; const e=w.exercises[w.exerciseIndex]; const total=w.exercises.length;
  $('exerciseStepLabel').textContent=`ÜBUNG ${w.exerciseIndex+1} / ${total}`;
  $('exerciseName').textContent=e.name;
  $('exerciseInstruction').textContent=e.help;
  $('exerciseSets').value=e.sets;
  $('exerciseReps').value=e.reps;
  $('exerciseWeightMin').value=e.weight_min_kg;
  $('exerciseWeightMax').value=e.weight_max_kg;
  $('exerciseNotes').value=e.notes||'';
  $('exerciseBackBtn').disabled=w.exerciseIndex===0;
  $('exerciseNextBtn').textContent=w.exerciseIndex===total-1?'Zum Abschluss →':'Nächste Übung →';
}

function nextExercise(){
  saveCurrentExerciseFields();
  const w=state.workout;
  if(w.exerciseIndex < w.exercises.length-1){ w.exerciseIndex++; renderExerciseStep(); return; }
  hideTrainingCards();
  $('trainingFinishCard').classList.remove('hidden');
  $('finishTitle').textContent=w.type+' abschliessen';
  $('finishStepLabel').textContent='LETZTER SCHRITT';
  $('exerciseSummary').classList.remove('hidden');
  $('exerciseSummary').innerHTML='<strong>Übungen erfasst</strong>'+w.exercises.map(e=>`<div><span>${esc(e.name)}</span><b>${esc(e.sets)}×${esc(e.reps)} · ${e.weight_min_kg||'—'}–${e.weight_max_kg||'—'} kg</b></div>`).join('');
  $('finishBackBtn').textContent='← Letzte Übung';
}

function backExercise(){
  saveCurrentExerciseFields();
  if(state.workout.exerciseIndex>0){ state.workout.exerciseIndex--; renderExerciseStep(); }
}

function finishBack(){
  if(state.workout && isStrength(state.workout.type)){
    hideTrainingCards(); $('exerciseWizardCard').classList.remove('hidden');
    state.workout.exerciseIndex=state.workout.exercises.length-1; renderExerciseStep();
  } else {
    resetTrainingWizard();
  }
}

async function saveWorkout(){
  const w=state.workout;
  if(!w) return;
  const dur=Number($('durationMin').value);
  if(!dur) return setStatus('trainingStatus','Dauer fehlt','err');
  const trainingPayload={date:w.date,type:w.type,duration_min:dur,avg_hr:$('avgHr').value||'',max_hr:$('maxHr').value||'',rpe:$('rpe').value||'',notes:$('trainingNotes').value||''};
  try{
    setStatus('trainingStatus','Speichere Training …');
    post('addTraining',trainingPayload);
    if(isStrength(w.type)){
      w.exercises.forEach((e,idx)=>post('addExercise',{
        date:w.date, training_type:w.type, exercise_order:idx+1, exercise:e.name,
        sets:e.sets, reps:e.reps, weight_min_kg:e.weight_min_kg||'', weight_max_kg:e.weight_max_kg||'', notes:e.notes||''
      }));
    }
    await new Promise(r=>setTimeout(r,1700));
    await loadData();
    setStatus('trainingStatus','Gespeichert ✓','ok');
    setTimeout(resetTrainingWizard,700);
  }catch(e){ setStatus('trainingStatus',e.message,'err'); }
}

document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
$('refreshBtn').addEventListener('click',loadData);
$('saveSetupBtn').addEventListener('click',async()=>{
  localStorage.setItem('hf_api_url',$('apiUrl').value.trim()); localStorage.setItem('hf_api_token',$('apiToken').value.trim());
  try{setStatus('setupStatus','Teste Verbindung …');const r=await jsonp('ping');if(r.ok){setStatus('setupStatus','Verbunden ✓','ok');showView('dashboardView');await loadData();}}
  catch(e){setStatus('setupStatus',e.message,'err');}
});
$('changeConnectionBtn').addEventListener('click',showSetup);
$('saveGoalBtn').addEventListener('click',()=>{localStorage.setItem('hf_goal',$('goalInput').value||83);renderAll();});
$('saveWeightBtn').addEventListener('click',()=>{const v=Number($('weightKg').value);if(!v)return setStatus('weightStatus','Gewicht fehlt','err');saveAndRefresh('addWeight',{date:$('weightDate').value,weight_kg:v},'weightStatus');$('weightKg').value='';});
$('saveWaistBtn').addEventListener('click',()=>{const v=Number($('waistCm').value);if(!v)return setStatus('waistStatus','Umfang fehlt','err');saveAndRefresh('addMeasurement',{date:$('waistDate').value,waist_cm:v},'waistStatus');$('waistCm').value='';});
$('startTrainingBtn').addEventListener('click',startTrainingWizard);
$('exerciseNextBtn').addEventListener('click',nextExercise);
$('exerciseBackBtn').addEventListener('click',backExercise);
$('cancelWizardBtn').addEventListener('click',resetTrainingWizard);
$('finishBackBtn').addEventListener('click',finishBack);
$('saveTrainingBtn').addEventListener('click',saveWorkout);
['weightDate','trainingDate','waistDate'].forEach(id=>$(id).value=today());
if(hasConfig()) loadData(); else showSetup();
