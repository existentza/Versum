let participants = [];
let tournamentActive = false;
let currentPhase = '';
let currentMatches = [];
let winners = [];

// Timer variables
let timerInterval = null;
let currentTime = 120;
let isTimerRunning = false;

const themes = [
    "Amore e relazioni",
    "Sfide della vita",
    "Successo e fallimento",
    "Famiglia",
    "Amicizia",
    "Soldi e ricchezza",
    "Strada e quartiere",
    "Sogni e ambizioni",
    "Scuola e educazione",
    "Tecnologia e social media",
    "Musica e arte",
    "Sport e competizione",
    "Viaggio e avventura",
    "Tempo e nostalgia",
    "Libertà e indipendenza",
    "Paura e coraggio",
    "Giustizia e ingiustizia",
    "Natura e ambiente",
    "Fama e riconoscimento",
    "Tradizione e modernità",
    "Solitudine e compagnia",
    "Festa e celebrazione",
    "Lavoro e carriera",
    "Salute e benessere",
    "Creatività e ispirazione"
];

function showTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        addParticipant();
    }
}

function addParticipant() {
    const input = document.getElementById('participantName');
    const name = input.value.trim();
    
    if (name && !participants.includes(name) && !tournamentActive) {
        participants.push(name);
        input.value = '';
        updateParticipantsList();
    }
}

function removeParticipant(name) {
    if (!tournamentActive) {
        participants = participants.filter(p => p !== name);
        updateParticipantsList();
    }
}

function clearParticipants() {
    if (!tournamentActive) {
        participants = [];
        updateParticipantsList();
        resetTournament();
    }
}

function updateParticipantsList() {
    const list = document.getElementById('participantsList');
    list.innerHTML = participants.map(name => 
        `<div class="participant-tag">
            ${name}
            ${!tournamentActive ? `<button class="remove-participant" onclick="removeParticipant('${name}')">×</button>` : ''}
        </div>`
    ).join('');
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getPhaseTitle(remainingPlayers) {
    if (remainingPlayers <= 2) return 'FINALE';
    if (remainingPlayers <= 4) return 'SEMIFINALE';
    if (remainingPlayers <= 8) return 'QUARTI DI FINALE';
    if (remainingPlayers <= 16) return 'OTTAVI DI FINALE';
    return `TURNO ${Math.ceil(Math.log2(participants.length)) - Math.ceil(Math.log2(remainingPlayers)) + 1}`;
}

function createMatches(players) {
    const shuffled = shuffleArray(players);
    const matches = [];
    
    if (shuffled.length % 2 === 0) {
        // Numero pari: solo 1v1
        for (let i = 0; i < shuffled.length; i += 2) {
            matches.push({
                type: '1v1',
                players: [shuffled[i], shuffled[i + 1]],
                winner: null,
                completed: false
            });
        }
    } else {
        // Numero dispari: una triangolare e il resto 1v1
        matches.push({
            type: 'triangular',
            players: [shuffled[0], shuffled[1], shuffled[2]],
            winner: null,
            completed: false
        });
        
        for (let i = 3; i < shuffled.length; i += 2) {
            if (shuffled[i + 1]) {
                matches.push({
                    type: '1v1',
                    players: [shuffled[i], shuffled[i + 1]],
                    winner: null,
                    completed: false
                });
            }
        }
    }
    
    return matches;
}

function startTournament() {
    if (participants.length < 2) {
        alert('Servono almeno 2 partecipanti per iniziare il torneo!');
        return;
    }
    
    tournamentActive = true;
    winners = [...participants];
    currentPhase = getPhaseTitle(winners.length);
    currentMatches = createMatches(winners);
    
    updateTournamentDisplay();
    renderMatches();
    
    document.getElementById('startTournamentBtn').style.display = 'none';
    document.getElementById('resetTournamentBtn').style.display = 'inline-block';
    document.getElementById('tournamentStatus').style.display = 'block';
    
    updateParticipantsList();
}

function resetTournament() {
    tournamentActive = false;
    currentMatches = [];
    winners = [];
    currentPhase = '';
    
    document.getElementById('startTournamentBtn').style.display = 'inline-block';
    document.getElementById('resetTournamentBtn').style.display = 'none';
    document.getElementById('tournamentStatus').style.display = 'none';
    document.getElementById('nextPhaseBtn').style.display = 'none';
    document.getElementById('winnerAnnouncement').style.display = 'none';
    document.getElementById('matchesContainer').innerHTML = '';
    
    updateParticipantsList();
}

function updateTournamentDisplay() {
    document.getElementById('phaseTitle').textContent = currentPhase;
    document.getElementById('phaseDescription').textContent = 
        `${winners.length} partecipanti - ${currentMatches.length} ${currentMatches.length === 1 ? 'scontro' : 'scontri'}`;
}

function renderMatches() {
    const container = document.getElementById('matchesContainer');
    container.innerHTML = currentMatches.map((match, index) => {
        const playersHtml = match.players.map(player => 
            `<button class="participant-btn ${match.winner === player ? 'winner' : ''}" 
                        onclick="selectWinner('${player}', ${index})"
                        ${match.completed ? 'disabled' : ''}>
                ${player}
                </button>`
        ).join(match.type === 'triangular' ? '<div class="vs-divider">VS</div>' : '<div class="vs-divider">VS</div>');
        
        return `<div class="match-card ${match.completed ? 'completed' : ''}">
            <div class="match-title">
                ${match.type === 'triangular' ? '🔺 TRIANGOLARE' : '⚔️ 1 VS 1'} - Scontro ${index + 1}
            </div>
            ${playersHtml}
            ${match.completed ? `<p style="margin-top: 15px; color: #00ff88; font-weight: bold;">Vincitore: ${match.winner}</p>` : ''}
        </div>`;
    }).join('');
}

function selectWinner(winner, matchIndex) {
    if (currentMatches[matchIndex].completed) return;
    
    currentMatches[matchIndex].winner = winner;
    currentMatches[matchIndex].completed = true;
    
    renderMatches();
    checkPhaseCompletion();
}

function checkPhaseCompletion() {
    const allCompleted = currentMatches.every(match => match.completed);
    
    if (allCompleted) {
        winners = currentMatches.map(match => match.winner);
        
        if (winners.length === 1) {
            // Torneo finito!
            showWinner(winners[0]);
        } else {
            // Mostra pulsante per fase successiva
            document.getElementById('nextPhaseBtn').style.display = 'block';
        }
    }
}

function nextPhase() {
    currentPhase = getPhaseTitle(winners.length);
    currentMatches = createMatches(winners);
    
    updateTournamentDisplay();
    renderMatches();
    
    document.getElementById('nextPhaseBtn').style.display = 'none';
}

function showWinner(winner) {
    document.getElementById('winnerAnnouncement').innerHTML = 
        `🏆 VINCITORE DEL TORNEO: <br>${winner.toUpperCase()} 🏆`;
    document.getElementById('winnerAnnouncement').style.display = 'block';
    document.getElementById('nextPhaseBtn').style.display = 'none';
}

// Theme functions
function generateTheme() {
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    document.getElementById('themeDisplay').textContent = randomTheme;
}

// Timer functions
function updateTimerDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (!isTimerRunning) {
        const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
        currentTime = minutes * 60 + seconds;
        
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            if (currentTime > 0) {
                currentTime--;
                updateTimerDisplay();
            } else {
                pauseTimer();
                alert('Tempo scaduto!');
            }
        }, 1000);
    }
}

function pauseTimer() {
    isTimerRunning = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    pauseTimer();
    const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
    currentTime = minutes * 60 + seconds;
    updateTimerDisplay();
}

// Event listeners
document.getElementById('timerMinutes').addEventListener('input', resetTimer);
document.getElementById('timerSeconds').addEventListener('input', resetTimer);

// Initialize
updateTimerDisplay();