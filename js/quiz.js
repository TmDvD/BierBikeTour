// Spieler beitreten
document.getElementById('joinBtn')?.addEventListener('click', () => {
  const name = document.getElementById('playerName').value;
  const team = document.getElementById('teamSelect').value;
  if(!name) return alert("Name eingeben!");
  db.collection('players').add({name, team, score:0})
    .then(() => {
      document.getElementById('name-team').style.display='none';
      document.getElementById('quizArea').style.display='block';
    });
});

// Admin Lobby anzeigen
const redDiv = document.getElementById('redTeam');
const blueDiv = document.getElementById('blueTeam');
db.collection('players').onSnapshot(snapshot => {
  redDiv.innerHTML = '';
  blueDiv.innerHTML = '';
  snapshot.forEach(doc=>{
    const data = doc.data();
    const el = document.createElement('div');
    el.textContent = data.name;
    if(data.team==='rot') redDiv.appendChild(el);
    else blueDiv.appendChild(el);
  });
});

// Quiz starten – Beispielstruktur
document.getElementById('startBtn')?.addEventListener('click', ()=>{
  db.collection('game').doc('state').set({currentQuestion:0, started:true});
});

// Fragen-Aktualisierung
db.collection('game').doc('state').onSnapshot(doc=>{
  const data = doc.data();
  document.getElementById('currentQuestion')?.innerText = "Aktuelle Frage: "+(data?.currentQuestion+1||"");
});
