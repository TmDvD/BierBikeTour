// --- Spieler beitreten ---
document.getElementById('joinBtn')?.addEventListener('click', () => {
  const name = document.getElementById('playerName').value;
  const team = document.getElementById('teamSelect').value;
  if(!name) return alert("Bitte Name eingeben!");
  
  db.collection('players').add({name, team, score:0})
    .then(() => {
      document.getElementById('name-team').style.display='none';
      document.getElementById('quizArea').style.display='block';
    });
});

// --- Admin Lobby & Team-Punkte ---
const redDiv = document.getElementById('redTeam');
const blueDiv = document.getElementById('blueTeam');
const redScoreEl = document.getElementById('redScore');
const blueScoreEl = document.getElementById('blueScore');

function updateLobbyAndScores(){
  db.collection('players').get().then(snapshot=>{
    let redScore=0, blueScore=0;
    redDiv.innerHTML='<h3>Rotes Team</h3>';
    blueDiv.innerHTML='<h3>Blaues Team</h3>';
    snapshot.forEach(doc=>{
      const data = doc.data();
      const el = document.createElement('div');
      el.textContent = data.name + " (" + data.score + " Punkte)";
      if(data.team==='rot'){ redDiv.appendChild(el); redScore += data.score || 0; }
      else { blueDiv.appendChild(el); blueScore += data.score || 0; }
    });
    redScoreEl.textContent = redScore;
    blueScoreEl.textContent = blueScore;
  });
}
// Aktualisierung alle 3 Sekunden
setInterval(updateLobbyAndScores,3000);

// --- Quiz starten ---
document.getElementById('startBtn')?.addEventListener('click', ()=>{
  db.collection('game').doc('state').set({currentQuestion:0, started:true});
});

// --- Fragen & Timer ---
let currentQ=0;
let timerInterval;

// --- Fragen (10 Kategorien x 5 Fragen Platzhalter) ---
let questions = [
  // Kategorie 1
  {category:"Allgemeinwissen", question:"Frage 1?", points:1, options:["A","B","C","D"], answer:0},
  {category:"Allgemeinwissen", question:"Frage 2?", points:2, options:["A","B","C","D"], answer:1},
  {category:"Allgemeinwissen", question:"Frage 3?", points:3, options:["A","B","C","D"], answer:2},
  {category:"Allgemeinwissen", question:"Frage 4?", points:4, options:["A","B","C","D"], answer:3},
  {category:"Allgemeinwissen", question:"Frage 5?", points:5, options:["A","B","C","D"], answer:0},
  // Kategorie 2
  {category:"Geographie", question:"Frage 1?", points:1, options:["A","B","C","D"], answer:0},
  {category:"Geographie", question:"Frage 2?", points:2, options:["A","B","C","D"], answer:1},
  {category:"Geographie", question:"Frage 3?", points:3, options:["A","B","C","D"], answer:2},
  {category:"Geographie", question:"Frage 4?", points:4, options:["A","B","C","D"], answer:3},
  {category:"Geographie", question:"Frage 5?", points:5, options:["A","B","C","D"], answer:0},
  // Kategorie 3
  {category:"Geschichte", question:"Frage 1?", points:1, options:["A","B","C","D"], answer:0},
  {category:"Geschichte", question:"Frage 2?", points:2, options:["A","B","C","D"], answer:1},
  {category:"Geschichte", question:"Frage 3?", points:3, options:["A","B","C","D"], answer:2},
  {category:"Geschichte", question:"Frage 4?", points:4, options:["A","B","C","D"], answer:3},
  {category:"Geschichte", question:"Frage 5?", points:5, options:["A","B","C","D"], answer:0},
  // Kategorie 4
  {category:"Sport", question:"Frage 1?", points:1, options:["A","B","C","D"], answer:0},
  {category:"Sport", question:"Frage 2?", points:2, options:["A","B","C","D"], answer:1},
  {category:"Sport", question:"Frage 3?", points:3, options:["A","B","C","D"], answer:2},
  {category:"Sport", question:"Frage 4?", points:4, options:["A","B","C","D"], answer:3},
  {category:"Sport", question:"Frage 5?", points:5, options:["A","B","C","D"], answer:0},
  // Kategorie 5
  {category:"Musik", question:"Frage 1?", points:1, options:["A","B","C","D"], answer:0},
  {category:"Musik", question:"Frage 2?", points:2, options:["A","B","C","D"], answer:1},
  {category:"Musik", question:"Frage 3?", points:3, options:["A","B","C","D"], answer:2},
  {category:"Musik", question:"Frage 4?", points:4, options:["A","B","C","D"], answer:3},
  {category:"Musik", question:"Frage 5?", points:5, options:["A","B","C","D"], answer:0},
  // Kategorie 6
  {category:"Technik", question:"Frage 1?", points:1, options:["A","B","C","D"], answer:0},
  {category:"Technik", question:"Frage 2?", points:2, options:["A","B","C","D"], answer:1},
  {category:"Technik", question:"Frage 3?", points:3, options:["A","B","C","D"], answer:2},
  {category:"Technik", question:"Frage 4?", points:4, options:["A","B","C","D"], answer:3},
  {category:"Technik", question:"Frage 5?", points:5, options:["A","B","C","D"], answer:0},
  // Kategorie 7
  {category:"Film & Serien", question:"Frage 1?", points:1, options:["A","B","C","D"], answer:0},
  {category:"Film & Serien", question:"Frage 2?", points:2, options:["A","B","C","D"], answer:1},
  {category:"Film & Serien", question:"Frage 3?", points:3, options:["A","B","C","D"], answer:2},
  {category:"Film & Serien", question:"Frage 4?", points:4, options:["A","B","C","D"], answer:3},
  {category:"Film & Serien", question:"Frage 5?", points:5, options:["A","B","C","D"], answer:0},
  // Kategorie 8
  {category:"Natur", question:"Frage 1?", points:1, options:["A","B","C","D"], answer:0},
  {category:"Natur", question:"Frage 2?", points:2, options:["A","B","C","D"], answer:1},
  {category:"Natur", question:"Frage 3?", points:3, options:["A","B","C","D"], answer:2},
  {category:"Natur", question:"Frage 4?", points:4, options:["A","B","C","D"], answer:3},
  {category:"Natur", question:"Frage 5?", points:5, options:["A","B","C","D"], answer:0},
  // Kategorie 9
  {category:"Wissenschaft", question:"Frage 1?", points:1, options:["A","B","C","D"], answer:0},
  {category:"Wissenschaft", question:"Frage 2?", points:2, options:["A","B","C","D"], answer:1},
  {category:"Wissenschaft", question:"Frage 3?", points:3, options:["A","B","C","D"], answer:2},
  {category:"Wissenschaft", question:"Frage 4?", points:4, options:["A","B","C","D"], answer:3},
  {category:"Wissenschaft", question:"Frage 5?", points:5, options:["A","B","C","D"], answer:0},
  // Kategorie 10
  {category:"Sonstiges", question:"Frage 1?", points:1, options:["A","B","C","D"], answer:0},
  {category:"Sonstiges", question:"Frage 2?", points:2, options:["A","B","C","D"], answer:1},
  {category:"Sonstiges", question:"Frage 3?", points:3, options:["A","B","C","D"], answer:2},
  {category:"Sonstiges", question:"Frage 4?", points:4, options:["A","B","C","D"], answer:3},
  {category:"Sonstiges", question:"Frage 5?", points:5, options:["A","B","C","D"], answer:0},
];

// --- Fragen anzeigen ---
db.collection('game').doc('state').onSnapshot(doc=>{
  const data = doc.data();
  if(data?.started){
    showQuestion(currentQ);
  }
});

function showQuestion(index){
  if(index >= questions.length){
    document.getElementById('quizArea').innerHTML="<h2>Danke fürs Mitmachen! 🍺</h2>";
    return;
  }
  const q = questions[index];
  document.getElementById('categoryTitle').textContent = q.category;
  document.getElementById('questionText').textContent = q.question;
  document.getElementById('pointsNumber').textContent = q.points;
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML='';
  
  q.options.forEach((opt,i)=>{
    const optDiv = document.createElement('div');
    optDiv.textContent = opt;
    optDiv.addEventListener('click', async ()=>{
      const playerName = document.getElementById('playerName').value;
      const playerRef = await db.collection('players')
                        .where('name','==',playerName)
                        .get();
      if(!playerRef.empty){
        const playerDoc = playerRef.docs[0];
        let playerData = playerDoc.data();
        if(i === q.answer){
          let newScore = (playerData.score || 0) + q.points;
          playerDoc.ref.update({score:newScore});
        }
      }
      currentQ++;
      showQuestion(currentQ);
    });
    optionsDiv.appendChild(optDiv);
  });

  let time=15;
  document.getElementById('timer').textContent=time;
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    time--;
    document.getElementById('timer').textContent=time;
    if(time<=0){ 
      clearInterval(timerInterval); 
      currentQ++; 
      showQuestion(currentQ); 
    }
  },1000);
}
