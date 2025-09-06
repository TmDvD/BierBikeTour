<script>
// --- Firebase Reference ---
const playersCol = db.collection('players');
const gameState = db.collection('game').doc('state');

let currentQ = 0;
let timerInterval;

// Beispiel-Fragen
let questions = [
  {category:"Allgemeinwissen", question:"Frage 1?", points:1, options:["A","B","C","D"], answer:0},
  {category:"Allgemeinwissen", question:"Frage 2?", points:2, options:["A","B","C","D"], answer:1},
  {category:"Allgemeinwissen", question:"Frage 3?", points:3, options:["A","B","C","D"], answer:2},
  {category:"Allgemeinwissen", question:"Frage 4?", points:4, options:["A","B","C","D"], answer:3},
  {category:"Allgemeinwissen", question:"Frage 5?", points:5, options:["A","B","C","D"], answer:0}
];

// Spieler beitreten
document.getElementById('joinBtn')?.addEventListener('click', () => {
  const name = document.getElementById('playerName').value.trim();
  const team = document.getElementById('teamSelect')?.value;
  if(!name) return alert("Bitte Name eingeben!");
  if(!team) return alert("Bitte Team auswählen!");
  playersCol.add({name, team, score:0}).then(()=>{
    document.getElementById('name-team').style.display='none';
    document.getElementById('quizArea').style.display='block';
  });
});

// Admin Lobby & Team-Punkte
function updateLobbyAndScores(){
  playersCol.get().then(snapshot=>{
    let redScore=0, blueScore=0;
    const redDiv = document.getElementById('redTeam');
    const blueDiv = document.getElementById('blueTeam');
    redDiv.innerHTML="<h3>Rotes Team</h3>";
    blueDiv.innerHTML="<h3>Blaues Team</h3>";
    snapshot.forEach(doc=>{
      const data = doc.data();
      const el = document.createElement('div');
      el.textContent = data.name + " (" + (data.score||0) + " Punkte)";
      if(data.team==="rot"){ redDiv.appendChild(el); redScore+=data.score||0; }
      else { blueDiv.appendChild(el); blueScore+=data.score||0; }
    });
    document.getElementById('redScore').textContent = redScore;
    document.getElementById('blueScore').textContent = blueScore;
  });
}
setInterval(updateLobbyAndScores,3000);

// Quiz starten
document.getElementById('startBtn')?.addEventListener('click', ()=>{
  gameState.set({currentQuestion:0, started:true});
});

// Firestore Listener
gameState.onSnapshot(doc=>{
  const data = doc.data();
  if(!data) return;

  // Spiel läuft
  if(data.started === true){
    const dbQ = data.currentQuestion ?? 0;

    // Quiz läuft
    if(dbQ < questions.length){
      currentQ = dbQ;
      document.getElementById('endOverlay').style.display = 'none';
      document.getElementById('quizArea').style.display = 'block';
      showQuestion(currentQ);
    } 
    // Quiz beendet
    else {
      document.getElementById('quizArea').style.display = 'none';
      document.getElementById('endOverlay').style.display = 'flex';
    }
  }
  // Spiel noch nicht gestartet
  else {
    document.getElementById('quizArea').style.display = 'none';
    document.getElementById('endOverlay').style.display = 'none';
    document.getElementById('joinArea').style.display = 'block';
  }
});

// Frage anzeigen
function showQuestion(index){
  const q = questions[index];
  if(!q) return;

  document.getElementById('categoryTitle').textContent = q.category;
  document.getElementById('questionText').textContent = q.question;
  document.getElementById('pointsNumber').textContent = q.points;

  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = "";
  q.options.forEach((opt,i)=>{
    const div = document.createElement('div');
    div.textContent=opt;
    div.className = "answerBtn";
    div.addEventListener('click', async ()=>{
      const playerName = document.getElementById('playerName').value;
      const snapshot = await playersCol.where('name','==',playerName).get();
      if(!snapshot.empty){
        const docRef = snapshot.docs[0];
        const playerData = docRef.data();
        if(i === q.answer){
          const newScore = (playerData.score||0) + q.points;
          docRef.ref.update({score:newScore});
        }
      }
      gameState.update({ currentQuestion: index+1 });
    });
    optionsDiv.appendChild(div);
  });

  let time = 15;
  document.getElementById('timer').textContent = time;
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    time--;
    document.getElementById('timer').textContent = time;
    if(time <= 0){
      clearInterval(timerInterval);
      gameState.update({ currentQuestion: index+1 });
    }
  }, 1000);
}

// Endoverlay Button zurück zum Start
document.getElementById('backToStartBtn')?.addEventListener('click', ()=>{
  document.getElementById('endOverlay').style.display = 'none';
  document.getElementById('quizArea').style.display = 'none';
  document.getElementById('joinArea').style.display = 'block';
  currentQ = 0;
});
</script>
