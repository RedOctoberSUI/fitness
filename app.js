// Larry Fit Frontend – Version 0.6
const state = {
  data: { weights: [], measurements: [], training: [], exercises: [] },
  workout: null
};

const $ = (id) => document.getElementById(id);
const today = () => new Date().toISOString().slice(0,10);

const workoutPlans = {
  'Kraft A': [
    { kind:'warmup', name:'Warm-up', minutes:10, help:'10 Minuten auf Ergometer oder Stepper. Locker beginnen und gegen Ende leicht steigern. Du sollst warm werden, aber noch problemlos sprechen können.' },
    { name:'Goblet Squat', sets:3, reps:10, help:'Eine Kurzhantel vor der Brust halten. Füsse etwa schulterbreit. Hüfte nach unten/hinten, Knie folgen den Fussspitzen. Fersen bleiben am Boden.' },
    { name:'Bankdrücken Multipower', sets:3, reps:10, help:'Bank flach stellen. Stange ungefähr über der Brust. Schulterblätter leicht nach hinten/unten, Füsse fest auf den Boden. Stange kontrolliert zur Brust senken und hochdrücken.' },
    { name:'Latziehen Kabelzug', sets:3, reps:10, help:'Breite Stange am oberen Kabel. Brust leicht raus, Ellbogen nach unten ziehen. Stange zur oberen Brust, nicht hinter den Kopf. Langsam zurück.' },
    { name:'Schulterdrücken Kurzhanteln', sets:3, reps:10, help:'Bank auf ca. 70–80°. Hanteln auf Schulterhöhe starten. Nach oben drücken, ohne stark ins Hohlkreuz zu gehen. Kontrolliert absenken.' },
    { name:'Rudern Kabelzug', sets:3, reps:10, help:'Griff auf Bauch-/Brusthöhe. Stabil sitzen oder stehen. Griff zum Bauch ziehen, Schulterblätter hinten zusammen. Oberkörper bleibt ruhig.' },
    { name:'Seitheben Kurzhanteln', sets:3, reps:10, help:'Leichte Hanteln seitlich am Körper. Arme mit leicht gebeugten Ellbogen seitlich bis ungefähr Schulterhöhe anheben. Nicht mit Schwung arbeiten und Schultern nicht hochziehen.' },
    { name:'Bauch auf dem Bock', sets:3, reps:10, help:'Stabil auf dem Bauch-/Rückenbock positionieren. Bauch anspannen und den Oberkörper kontrolliert einrollen bzw. anheben. Nicht am Kopf ziehen und ohne Schwung arbeiten.' },
    { name:'Plank', sets:3, reps:1, help:'Unterarme aufstützen, Körper von Kopf bis Ferse möglichst gerade. Bauch und Gesäss anspannen. 30–60 Sekunden halten; abbrechen, sobald die Hüfte deutlich absinkt.' },
    { kind:'cooldown', name:'Cool-down & Dehnen', minutes:5, help:'Je ca. 30 Sek. pro Seite, angenehm ziehen – nicht schmerzen: 1) Hüftbeuger: ein Knie unten, Becken leicht vor. 2) Hintere Oberschenkel: Bein vor, Hüfte zurück, Rücken gerade. 3) Gesäss: im Sitzen Knöchel aufs andere Knie, leicht vorbeugen. 4) Brust/Schulter: Unterarm an Türrahmen, Körper wegdrehen. 5) Lat/Rücken: Hände an Bank/Turm, Hüfte zurück, Brust Richtung Boden.' }
  ],
  'Kraft B': [
    { kind:'warmup', name:'Warm-up', minutes:10, help:'10 Minuten auf Ergometer oder Stepper. Locker beginnen und gegen Ende leicht steigern. Du sollst warm werden, aber noch problemlos sprechen können.' },
    { name:'Ausfallschritte mit Kurzhanteln', sets:3, reps:8, help:'Je 8 Reps pro Bein. Einen kontrollierten Schritt nach vorne oder in Split-Squat-Position. Oberkörper aufrecht, vorderes Knie folgt der Fussspitze. Erst leicht starten.' },
    { name:'Brustdrücken Kurzhanteln', sets:3, reps:10, help:'Flach auf die Bank. Hanteln seitlich über der Brust. Schulterblätter leicht nach hinten/unten. Hochdrücken und kontrolliert wieder absenken.' },
    { name:'Latziehen enger Griff', sets:3, reps:10, help:'Engen oder neutralen Griff oben am Kabelzug. Brust aufrecht. Ellbogen Richtung Hüfte ziehen und langsam wieder strecken.' },
    { name:'Face Pull Kabelzug', sets:3, reps:12, help:'Seil ungefähr auf Gesichtshöhe. Zum Gesicht ziehen, Ellbogen nach aussen, Schulterblätter zusammen. Leichtes Gewicht und saubere Bewegung.' },
    { name:'Rumänisches Kreuzheben Kurzhanteln', sets:3, reps:10, help:'Hanteln vor den Oberschenkeln. Knie leicht gebeugt. Hüfte nach hinten schieben, Rücken neutral, Hanteln nah an den Beinen. Nur so tief, wie der Rücken stabil bleibt.' },
    { name:'Einarmiges Kabelrudern', sets:3, reps:10, help:'Je 10 Reps pro Seite. Kabel ungefähr auf Bauchhöhe. Schulter bleibt tief, Ellbogen kontrolliert nach hinten ziehen. Oberkörper möglichst ruhig halten.' },
    { name:'Rückenstrecker auf dem Bock', sets:3, reps:10, help:'Hüfte am Polster abstützen. Rücken neutral halten. Oberkörper kontrolliert absenken und bis zur geraden Körperlinie anheben – nicht ins Hohlkreuz überstrecken.' },
    { name:'Bauch auf dem Bock', sets:3, reps:10, help:'Stabil auf dem Bauch-/Rückenbock positionieren. Bauch anspannen und den Oberkörper kontrolliert einrollen bzw. anheben. Nicht am Kopf ziehen und ohne Schwung arbeiten.' },
    { kind:'cooldown', name:'Cool-down & Dehnen', minutes:5, help:'Je ca. 30 Sek. pro Seite, angenehm ziehen – nicht schmerzen: 1) Hüftbeuger: ein Knie unten, Becken leicht vor. 2) Hintere Oberschenkel: Bein vor, Hüfte zurück, Rücken gerade. 3) Gesäss: im Sitzen Knöchel aufs andere Knie, leicht vorbeugen. 4) Brust/Schulter: Unterarm an Türrahmen, Körper wegdrehen. 5) Lat/Rücken: Hände an Bank/Turm, Hüfte zurück, Brust Richtung Boden.' }
  ]
};

function config(){ return { url: localStorage.getItem('hf_api_url') || '', token: localStorage.getItem('hf_api_token') || '' }; }
function hasConfig(){ const c=config(); return c.url && c.token; }
function setStatus(id,msg,type=''){ const e=$(id); e.textContent=msg; e.className='status '+type; }
function esc(s=''){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function num(v,d=1){ const n=Number(v); return Number.isFinite(n)?n.toFixed(d):'—'; }
function isStrength(type){ return !!workoutPlans[type]; }
function ytSearch(q){ return 'https://www.youtube.com/results?search_query='+encodeURIComponent(q); }

// Links are deliberately matched to the equipment available in this gym:
// dumbbells/adjustable bench, Smith/Multipower, cable/Dual Adjustable Pulley and Roman-chair bench.
const exerciseVideos = {
  'Goblet Squat': {tutorial:'https://www.youtube.com/watch?v=nfX7IFK9UNI', mistakes:ytSearch('goblet squat common mistakes dumbbell proper form')},
  'Bankdrücken Multipower': {tutorial:ytSearch('Smith Machine bench press proper form tutorial'), mistakes:ytSearch('Smith Machine bench press common mistakes')},
  'Latziehen Kabelzug': {tutorial:ytSearch('cable lat pulldown proper form tutorial'), mistakes:ytSearch('lat pulldown common mistakes cable machine')},
  'Schulterdrücken Kurzhanteln': {tutorial:ytSearch('seated dumbbell shoulder press adjustable bench proper form'), mistakes:ytSearch('seated dumbbell shoulder press common mistakes')},
  'Rudern Kabelzug': {tutorial:ytSearch('seated cable row dual adjustable pulley proper form'), mistakes:ytSearch('seated cable row common mistakes cable machine')},
  'Seitheben Kurzhanteln': {tutorial:ytSearch('dumbbell lateral raise proper form tutorial'), mistakes:ytSearch('dumbbell lateral raise common mistakes')},
  'Bauch auf dem Bock': {tutorial:ytSearch('decline bench crunch proper form tutorial'), mistakes:ytSearch('decline bench crunch common mistakes')},
  'Plank': {tutorial:'https://www.youtube.com/watch?v=mwlp75MS6Rg', mistakes:ytSearch('plank common mistakes proper form')},
  'Ausfallschritte mit Kurzhanteln': {tutorial:ytSearch('dumbbell lunges proper form tutorial'), mistakes:ytSearch('dumbbell lunge common mistakes')},
  'Brustdrücken Kurzhanteln': {tutorial:ytSearch('dumbbell bench press adjustable bench proper form'), mistakes:ytSearch('dumbbell bench press common mistakes')},
  'Latziehen enger Griff': {tutorial:ytSearch('close neutral grip cable lat pulldown proper form'), mistakes:ytSearch('close grip lat pulldown common mistakes')},
  'Face Pull Kabelzug': {tutorial:ytSearch('cable face pull rope proper form tutorial'), mistakes:ytSearch('cable face pull common mistakes')},
  'Rumänisches Kreuzheben Kurzhanteln': {tutorial:'https://www.youtube.com/watch?v=aa57T45iFSE', mistakes:ytSearch('dumbbell Romanian deadlift common mistakes')},
  'Einarmiges Kabelrudern': {tutorial:ytSearch('single arm cable row dual adjustable pulley proper form'), mistakes:ytSearch('single arm cable row common mistakes')},
  'Rückenstrecker auf dem Bock': {tutorial:ytSearch('Roman chair back extension proper form tutorial'), mistakes:ytSearch('Roman chair back extension common mistakes')}
};

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
  $('trainingList').innerHTML=t.slice(-12).reverse().map(x=>{const z=x.type==='Zone 2'&&x.device?` · ${esc(x.device)}${x.level!==''&&x.level!=null?' Stufe '+esc(x.level):''}${x.calories?' · '+esc(x.calories)+' kcal':''}`:'';return `<div class="list-row"><div><strong>${esc(x.type)}</strong><small>${esc(x.date)} · ${esc(x.duration_min)} min${x.rpe?' · RPE '+esc(x.rpe):''}${z}</small></div><div class="right"><strong>${x.avg_hr?esc(x.avg_hr)+' Ø':'—'}</strong><small>${x.max_hr?'max '+esc(x.max_hr):''}</small></div></div>`}).join('')||'<p class="muted">Noch keine Trainings.</p>';
  $('zone2HrLow').value=localStorage.getItem('lf_z2_low')||125;
  $('zone2HrHigh').value=localStorage.getItem('lf_z2_high')||140;
  renderCoachInsights();
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
  $('pageTitle').textContent=names[id]||'Larry Fit';
  if(id==='trainingView' && !state.workout) resetTrainingWizard();
}
function showSetup(){ $('apiUrl').value=config().url; $('apiToken').value=config().token; showView('setupView'); }

async function saveAndRefresh(action,payload,statusId){
  try{ setStatus(statusId,'Speichere …'); post(action,payload); await new Promise(r=>setTimeout(r,1300)); await loadData(); setStatus(statusId,'Gespeichert ✓','ok'); }
  catch(e){setStatus(statusId,e.message,'err');}
}

function hideTrainingCards(){
  ['trainingStartCard','zone2SetupCard','exerciseWizardCard','trainingFinishCard'].forEach(id=>$(id).classList.add('hidden'));
}

function resetTrainingWizard(){
  state.workout=null;
  hideTrainingCards();
  $('trainingStartCard').classList.remove('hidden');
  $('trainingDate').value=today();
  $('durationMin').value=''; $('rpe').value='7'; $('avgHr').value=''; $('maxHr').value=''; $('calories').value=''; $('trainingNotes').value=''; $('zone2Level').value=''; $('zone2FinishFields').classList.add('hidden');
  setStatus('trainingStatus','');
}

function startTrainingWizard(){
  const type=$('trainingType').value;
  const date=$('trainingDate').value || today();
  state.workout={ date, type, exerciseIndex:0, exercises:[] };
  hideTrainingCards();
  if(isStrength(type)){
    state.workout.exercises=workoutPlans[type].map(e=>({ ...e, weight_min_kg:'', weight_max_kg:'', duration_sec:e.name==='Plank'?45:'', set_data:!e.kind?Array.from({length:e.sets},()=>({reps:e.name==='Plank'?1:e.reps,weight_kg:'',duration_sec:e.name==='Plank'?45:''})):[], notes:'', warmup_minutes:e.kind==='warmup'?(e.minutes||10):'', warmup_level:'', warmup_calories:'' }));
    $('exerciseWizardCard').classList.remove('hidden');
    renderExerciseStep();
  } else if(type==='Zone 2') {
    state.workout.device=$('zone2Device').value || 'Rudern';
    state.workout.level='';
    $('zone2SetupCard').classList.remove('hidden');
  } else {
    $('trainingFinishCard').classList.remove('hidden');
    $('finishTitle').textContent=type+' abschliessen';
    $('finishStepLabel').textContent='SCHRITT 2';
    $('exerciseSummary').classList.add('hidden');
    $('zone2FinishFields').classList.add('hidden');
    $('finishBackBtn').textContent='← Zurück';
  }
}


function zone2Next(){
  if(!state.workout || state.workout.type!=='Zone 2') return;
  state.workout.device=$('zone2Device').value;
  state.workout.level=$('zone2Level').value;
  hideTrainingCards();
  $('trainingFinishCard').classList.remove('hidden');
  $('finishTitle').textContent='Zone 2 abschliessen';
  $('finishStepLabel').textContent='LETZTER SCHRITT';
  $('exerciseSummary').classList.remove('hidden');
  $('exerciseSummary').innerHTML=`<strong>Zone 2</strong><div><span>Gerät</span><b>${esc(state.workout.device)}</b></div><div><span>Stufe</span><b>${esc(state.workout.level||'—')}</b></div>`;
  $('zone2FinishFields').classList.remove('hidden');
  $('finishBackBtn').textContent='← Gerät / Stufe';
}

function zone2Back(){
  resetTrainingWizard();
}

function saveCurrentExerciseFields(){
  if(!state.workout || !isStrength(state.workout.type)) return;
  const e=state.workout.exercises[state.workout.exerciseIndex];
  if(e.kind==='warmup'){
    e.warmup_minutes=Number($('warmupMinutes').value)||10;
    e.warmup_level=$('warmupLevel').value;
    e.warmup_calories=$('warmupCalories').value;
    return;
  }
  if(e.kind) return;
  const rows=[...document.querySelectorAll('#setEntryArea .set-row')];
  e.set_data=rows.map(row=>({
    reps:e.name==='Plank'?1:(Number(row.querySelector('.set-reps')?.value)||0),
    weight_kg:e.name==='Plank'?'':(row.querySelector('.set-weight')?.value||''),
    duration_sec:e.name==='Plank'?(Number(row.querySelector('.set-duration')?.value)||0):''
  }));
  e.sets=e.set_data.length;
  if(e.name==='Plank'){
    e.reps=1;
    const ds=e.set_data.map(x=>Number(x.duration_sec)).filter(Number.isFinite);
    e.duration_sec=ds.length?Math.round(ds.reduce((a,b)=>a+b,0)/ds.length):45;
    e.weight_min_kg=''; e.weight_max_kg='';
  } else {
    const rs=e.set_data.map(x=>Number(x.reps)).filter(Number.isFinite);
    const ws=e.set_data.map(x=>Number(x.weight_kg)).filter(Number.isFinite);
    e.reps=rs.length?Math.max(...rs):e.reps;
    e.weight_min_kg=ws.length?Math.min(...ws):'';
    e.weight_max_kg=ws.length?Math.max(...ws):'';
  }
  e.notes=$('exerciseNotes').value.trim();
}

function parseSetData(row){
  try { const x=JSON.parse(row?.sets_json||'[]'); return Array.isArray(x)?x:[]; } catch(_){ return []; }
}
function incrementFor(name){
  return /Kurzhantel|Goblet|Ausfallschritte|Rumänisches/.test(name)?1:2.5;
}
function progressionFor(e,prev){
  if(!prev || e.name==='Plank') return null;
  const sets=parseSetData(prev);
  if(!sets.length) return null;
  const target=e.reps;
  const weights=sets.map(x=>Number(x.weight_kg)).filter(Number.isFinite);
  const reps=sets.map(x=>Number(x.reps)).filter(Number.isFinite);
  if(!weights.length || reps.length!==sets.length) return null;
  const base=Math.max(...weights); const inc=incrementFor(e.name);
  const missed=reps.reduce((sum,r)=>sum+Math.max(0,target-r),0);
  const same=weights.every(w=>Math.abs(w-base)<0.001);
  if(same && missed===0) return {weight:base+inc,text:`Alle Soll-Reps geschafft → nächstes Mal ca. ${base+inc} kg versuchen.`};
  if(missed<=2) return {weight:base,text:`Fast alle Soll-Reps geschafft → ${base} kg nochmals bestätigen.`};
  return {weight:Math.max(0,base-inc),text:`Mehrere Reps gefehlt → Technik priorisieren; ca. ${Math.max(0,base-inc)} kg erwägen.`};
}

function lastExerciseEntry(name){
  const rows=(state.data.exercises||[]).filter(x=>String(x.exercise)===String(name));
  if(!rows.length) return null;
  return [...rows].sort((a,b)=>{
    const da=String(a.date||'')+' '+String(a.timestamp||'');
    const db=String(b.date||'')+' '+String(b.timestamp||'');
    return da.localeCompare(db);
  }).pop();
}

function renderExerciseStep(){
  const w=state.workout; const e=w.exercises[w.exerciseIndex]; const total=w.exercises.length;
  const strengthNo=w.exercises.slice(0,w.exerciseIndex+1).filter(x=>!x.kind).length;
  $('exerciseStepLabel').textContent=e.kind==='warmup'?'WARM-UP · 10 MIN':e.kind==='cooldown'?'COOL-DOWN · 5 MIN':`ÜBUNG ${strengthNo} / 8`;
  $('exerciseName').textContent=e.name;
  $('exerciseInstruction').textContent=e.help;
  const linkBox=$('exerciseLinks'); const vids=exerciseVideos[e.name];
  if(vids && !e.kind){ linkBox.innerHTML=`<a href="${vids.tutorial}" target="_blank" rel="noopener">▶ Tutorial</a><a href="${vids.mistakes}" target="_blank" rel="noopener">⚠ Dos & Don'ts</a>`; linkBox.classList.remove('hidden'); }
  else { linkBox.innerHTML=''; linkBox.classList.add('hidden'); }
  $('warmupFields').classList.toggle('hidden',e.kind!=='warmup');
  $('exerciseFields').classList.toggle('hidden',!!e.kind);
  if(e.kind==='warmup'){
    $('warmupMinutes').value=e.warmup_minutes||10; $('warmupLevel').value=e.warmup_level||''; $('warmupCalories').value=e.warmup_calories||'';
  }
  if(!e.kind){
    $('exerciseNotes').value=e.notes||'';
    const prev=lastExerciseEntry(e.name); const box=$('lastExerciseWeight'); const hint=$('progressionHint');
    if(prev){
      const ps=parseSetData(prev);
      const prevText=ps.length ? ps.map((x,i)=>e.name==='Plank'?`S${i+1}: ${x.duration_sec||'—'} s`:`S${i+1}: ${x.reps||'—'}×${x.weight_kg||'—'} kg`).join(' · ') : (e.name==='Plank'?`${prev.duration_sec||'—'} Sek./Satz`:`${prev.weight_min_kg||'—'}–${prev.weight_max_kg||'—'} kg`);
      box.innerHTML=`<strong>Letztes Training:</strong> ${esc(prevText)} <span class="muted">(${esc(prev.date||'')})</span>`; box.classList.remove('hidden');
      const prog=progressionFor(e,prev); if(prog){hint.textContent='Larry: '+prog.text;hint.classList.remove('hidden');}else hint.classList.add('hidden');
    } else { box.textContent='Noch keine frühere Einheit für diese Übung.';box.classList.remove('hidden');hint.classList.add('hidden'); }
    const data=(e.set_data&&e.set_data.length)?e.set_data:Array.from({length:e.sets},()=>({reps:e.name==='Plank'?1:e.reps,weight_kg:'',duration_sec:e.name==='Plank'?45:''}));
    $('setEntryArea').innerHTML='<div class="set-head">Satz für Satz</div>'+data.map((x,i)=>e.name==='Plank'
      ? `<div class="set-row"><b>Satz ${i+1}</b><label>Sek.<input class="set-duration" type="number" min="5" max="600" value="${esc(x.duration_sec||45)}"></label></div>`
      : `<div class="set-row"><b>Satz ${i+1}</b><label>Reps<input class="set-reps" type="number" min="0" max="50" value="${esc(x.reps||e.reps)}"></label><label>kg<input class="set-weight" type="number" step="0.5" min="0" max="500" value="${esc(x.weight_kg||'')}"></label></div>`).join('');
  } else { $('lastExerciseWeight').classList.add('hidden'); $('progressionHint').classList.add('hidden'); $('setEntryArea').innerHTML=''; }
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
  $('zone2FinishFields').classList.add('hidden');
  $('exerciseSummary').innerHTML='<strong>Übungen erfasst</strong>'+w.exercises.filter(e=>!e.kind).map(e=>{const detail=e.name==='Plank'?(e.set_data||[]).map((x,i)=>`S${i+1} ${x.duration_sec||'—'}s`).join(' · '):(e.set_data||[]).map((x,i)=>`S${i+1} ${x.reps||'—'}×${x.weight_kg||'—'}kg`).join(' · ');return `<div><span>${esc(e.name)}</span><b>${detail}</b></div>`}).join('');
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
  } else if(state.workout && state.workout.type==='Zone 2') {
    hideTrainingCards(); $('zone2SetupCard').classList.remove('hidden');
    $('zone2Device').value=state.workout.device || 'Rudern';
    $('zone2Level').value=state.workout.level || '';
  } else {
    resetTrainingWizard();
  }
}

async function saveWorkout(){
  const w=state.workout;
  if(!w) return;
  const dur=Number($('durationMin').value);
  if(!dur) return setStatus('trainingStatus','Dauer fehlt','err');
  const warm=isStrength(w.type)?w.exercises.find(e=>e.kind==='warmup'):null;
  const training={date:w.date,type:w.type,duration_min:dur,avg_hr:$('avgHr').value||'',max_hr:$('maxHr').value||'',rpe:$('rpe').value||'',device:w.type==='Zone 2'?(w.device||''):'',level:w.type==='Zone 2'?(w.level||''):'',calories:w.type==='Zone 2'?($('calories').value||''):'',warmup_minutes:warm?(warm.warmup_minutes||10):'',warmup_level:warm?(warm.warmup_level||''):'',warmup_calories:warm?(warm.warmup_calories||''):'',notes:$('trainingNotes').value||''};
  const exercises=isStrength(w.type)?w.exercises.filter(e=>!e.kind).map((e,idx)=>({
    date:w.date, training_type:w.type, exercise_order:idx+1, exercise:e.name, sets:e.sets, reps:e.name==='Plank'?1:e.reps,
    duration_sec:e.name==='Plank'?(e.duration_sec||45):'', weight_min_kg:e.name==='Plank'?'':(e.weight_min_kg||''),
    weight_max_kg:e.name==='Plank'?'':(e.weight_max_kg||''), sets_json:JSON.stringify(e.set_data||[]), notes:e.notes||''
  })):[];
  try{
    const beforeCount=(state.data.exercises||[]).length;
    setStatus('trainingStatus','Speichere Training und '+exercises.length+' Übungen …');
    post('addWorkout',{training,exercises});
    await new Promise(r=>setTimeout(r,1800));
    await loadData();
    if(isStrength(w.type)){
      const afterCount=(state.data.exercises||[]).length;
      if(afterCount < beforeCount + exercises.length) throw new Error('Nicht alle Übungen wurden gespeichert. Bitte Google Sheet prüfen.');
      const saved=(state.data.exercises||[]).slice(-exercises.length);
      if(exercises.some(x=>!saved.some(y=>y.date===x.date && y.training_type===x.training_type && y.exercise===x.exercise))) throw new Error('Übungsdaten unvollständig. Bitte Google Sheet prüfen.');
    }
    setStatus('trainingStatus','Gespeichert ✓','ok');
    setTimeout(resetTrainingWizard,700);
  }catch(e){ setStatus('trainingStatus',e.message,'err'); }
}


function renderCoachInsights(){
  const out=[]; const weights=sorted(state.data.weights||[]);
  if(weights.length>=14){
    const recent=avg(weights.slice(-7).map(x=>Number(x.weight_kg))); const prev=avg(weights.slice(-14,-7).map(x=>Number(x.weight_kg))); const delta=recent-prev;
    if(delta>-0.2) out.push(`⚖ Gewicht: ${delta>=0?'+':''}${delta.toFixed(1)} kg/Woche. Unter Zieltempo – Portionen/Schritte prüfen.`);
    else if(delta<-0.8) out.push(`⚖ Gewicht: ${delta.toFixed(1)} kg/Woche. Schneller als geplant – Energiezufuhr und Regeneration prüfen.`);
    else out.push(`✓ Gewicht: ${delta.toFixed(1)} kg/Woche – im sinnvollen Zielbereich.`);
  }
  const z=(state.data.training||[]).filter(x=>x.type==='Zone 2'&&Number(x.avg_hr)).sort((a,b)=>String(a.date).localeCompare(String(b.date))).pop();
  if(z){ const lo=Number(localStorage.getItem('lf_z2_low')||125), hi=Number(localStorage.getItem('lf_z2_high')||140), hr=Number(z.avg_hr); const dev=z.device?`${z.device}${z.level!==''&&z.level!=null?' Stufe '+z.level:''}`:'Zone 2';
    if(hr<lo) out.push(`❤️ ${dev}: Ø ${hr} bpm – unter deinem Zone-2-Ziel. Nächstes Mal Stufe leicht erhöhen.`);
    else if(hr>hi) out.push(`❤️ ${dev}: Ø ${hr} bpm – über deinem Zone-2-Ziel. Nächstes Mal Stufe leicht reduzieren.`);
    else out.push(`✓ ${dev}: Ø ${hr} bpm – Zone 2 passt. Stufe beibehalten.`);
  }
  const ex=(state.data.exercises||[]).filter(x=>x.sets_json).sort((a,b)=>(String(a.date)+String(a.timestamp)).localeCompare(String(b.date)+String(b.timestamp))).pop();
  if(ex){ const plan=[...(workoutPlans[ex.training_type]||[])].find(x=>x.name===ex.exercise); const prog=plan?progressionFor(plan,ex):null; if(prog) out.push(`🏋 ${ex.exercise}: ${prog.text}`); }
  $('coachInsights').innerHTML=out.length?out.map(x=>`<div class="coach-line">${esc(x)}</div>`).join(''):'<p class="muted">Noch nicht genug Daten für Empfehlungen.</p>';
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
$('saveZone2Btn').addEventListener('click',()=>{localStorage.setItem('lf_z2_low',$('zone2HrLow').value||125);localStorage.setItem('lf_z2_high',$('zone2HrHigh').value||140);renderAll();});
$('saveWeightBtn').addEventListener('click',()=>{const v=Number($('weightKg').value);if(!v)return setStatus('weightStatus','Gewicht fehlt','err');saveAndRefresh('addWeight',{date:$('weightDate').value,weight_kg:v},'weightStatus');$('weightKg').value='';});
$('saveWaistBtn').addEventListener('click',()=>{const v=Number($('waistCm').value);if(!v)return setStatus('waistStatus','Umfang fehlt','err');saveAndRefresh('addMeasurement',{date:$('waistDate').value,waist_cm:v},'waistStatus');$('waistCm').value='';});
$('startTrainingBtn').addEventListener('click',startTrainingWizard);
$('zone2NextBtn').addEventListener('click',zone2Next);
$('zone2BackBtn').addEventListener('click',zone2Back);
$('exerciseNextBtn').addEventListener('click',nextExercise);
$('exerciseBackBtn').addEventListener('click',backExercise);
$('cancelWizardBtn').addEventListener('click',resetTrainingWizard);
$('finishBackBtn').addEventListener('click',finishBack);
$('saveTrainingBtn').addEventListener('click',saveWorkout);
['weightDate','trainingDate','waistDate'].forEach(id=>$(id).value=today());
if(hasConfig()) loadData(); else showSetup();
