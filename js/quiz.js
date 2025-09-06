<!-- Endoverlay -->
<div id="endOverlay" style="
  display:none;
  position:fixed;
  top:0; left:0; right:0; bottom:0;
  background:rgba(0,0,0,0.7);
  color:white;
  display:flex;
  justify-content:center;
  align-items:center;
  flex-direction:column;
  z-index:3000;
  text-align:center;
">
  <h2>Quiz beendet!</h2>
  <p>Danke fürs Mitmachen 🍺</p>
  <button id="backToStartBtn" style="
    margin-top:20px;
    padding:12px 24px;
    font-size:1.2em;
    border:none;
    border-radius:10px;
    background:#444;
    color:white;
    cursor:pointer;
  ">Zurück zum Start</button>
</div>

<script>
// Firebase
const playersCol = db.collection('players');
const gameState = db.collection('game').doc('state');

let currentQ = 0;
let timerInterval;

// Beispiel-Fragen
const questions = [
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
  if(!name || !team) return alert("Bitte Name und Team auswählen!");
  playersCol.add({name, team, score:0}).then(()=>{
    document.getElementById('joinArea').style.display='none';
    document.getElementById('quizArea').style.display='block';
  });
});

// Firestore Listener
gameState.onSnapshot(doc=>{
  const data = doc.data();
  if(!data) return;

  const started = data.started || false;
  const currentQuestion = data.currentQuestion ?? 0;

  if(!started){
    // Noch nicht gestartet
    document.getElementById('joinArea').style.display='block';
    document.getElementById('quizArea').style.display='none';
    document.getElementById('endOverlay').style.display='none';
  } 
  else if(currentQuestion < questions.length){
    // Quiz läuft
    currentQ = currentQuestion;
    document.getElementById('joinArea').style.display='none';
    document.getElementById('quizArea').style.display='block';
    document.getElementById('endOverlay').style.display='none';
    showQuestion(currentQ);
  } 
  else {
    // Quiz beendet
    document.getElementById('quizArea').style.display='none';
    document.getElementById('joinArea').style.display='none';
    document.getElementById('endOverlay').style.display='flex';
  }
});

// Fragen anzeigen
function showQuestion(index){
  const q = questions[index];
  if(!q) return;

  document.getElementById('categoryTitle').textContent = q.category;
  document.getElementById('questionText').textContent = q.question;
  document.getElementById('pointsNumber').textContent = q.points;

  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  q.options.forEach((opt,i)=>{
    const div = document.createElement('div');
    div.textContent = opt;
    div.className = "answerBtn";
    div.onclick = async ()=>{
      const playerName = document.getElementById('playerName').value;
      const snapshot = await playersCol.where('name','==',playerName).get();
      if(!snapshot.empty){
        const docRef = snapshot.docs[0];
        const playerData = docRef.data();
        if(i===q.answer){
          docRef.ref.update({score: (playerData.score||0) + q.points});
        }
      }
      gameState.update({currentQuestion: index+1});
    };
    optionsDiv.appendChild(div);
  });

  let time = 15;
  document.getElementById('timer').textContent = time;
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    time--;
    document.getElementById('timer').textContent = time;
    if(time<=0){
      clearInterval(timerInterval);
      gameState.update({currentQuestion: index+1});
    }
  },1000);
}

// Zurück zum Start
document.getElementById('backToStartBtn').onclick = ()=>{
  document.getElementById('endOverlay').style.display='none';
  document.getElementById('quizArea').style.display='none';
  document.getElementById('joinArea').style.display='block';
  currentQ = 0;
};
</script>
