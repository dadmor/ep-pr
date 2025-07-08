<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Po Waterloo - Gra Strategiczna</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #2c3e50, #3498db);
            margin: 0;
            padding: 20px;
            color: #ecf0f1;
            min-height: 100vh;
        }
        
        .game-container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(44, 62, 80, 0.9);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #e74c3c;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #e74c3c;
            font-size: 2.5em;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .game-info {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: rgba(52, 152, 219, 0.3);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            border: 2px solid #3498db;
        }
        
        .stat-card h3 {
            margin: 0 0 10px 0;
            color: #3498db;
        }
        
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #e74c3c;
        }
        
        .game-board {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .map-area {
            background: rgba(39, 174, 96, 0.2);
            border: 3px solid #27ae60;
            border-radius: 10px;
            padding: 20px;
            min-height: 400px;
        }
        
        .region {
            background: rgba(241, 196, 15, 0.3);
            border: 2px solid #f1c40f;
            border-radius: 8px;
            padding: 10px;
            margin: 10px 0;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .region:hover {
            background: rgba(241, 196, 15, 0.5);
            transform: translateY(-2px);
        }
        
        .region.controlled {
            background: rgba(46, 204, 113, 0.4);
            border-color: #2ecc71;
        }
        
        .region.hostile {
            background: rgba(231, 76, 60, 0.4);
            border-color: #e74c3c;
        }
        
        .actions-panel {
            background: rgba(155, 89, 182, 0.2);
            border: 3px solid #9b59b6;
            border-radius: 10px;
            padding: 20px;
        }
        
        .action-button {
            width: 100%;
            padding: 15px;
            margin: 10px 0;
            border: none;
            border-radius: 8px;
            background: linear-gradient(45deg, #e74c3c, #c0392b);
            color: white;
            font-size: 1.1em;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: bold;
        }
        
        .action-button:hover {
            background: linear-gradient(45deg, #c0392b, #a93226);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
        }
        
        .action-button:disabled {
            background: #7f8c8d;
            cursor: not-allowed;
            transform: none;
        }
        
        .events-log {
            background: rgba(44, 62, 80, 0.8);
            border: 2px solid #34495e;
            border-radius: 10px;
            padding: 20px;
            height: 200px;
            overflow-y: auto;
        }
        
        .event-item {
            padding: 10px;
            margin: 5px 0;
            background: rgba(52, 152, 219, 0.1);
            border-left: 4px solid #3498db;
            border-radius: 5px;
        }
        
        .event-item.success {
            border-left-color: #27ae60;
            background: rgba(39, 174, 96, 0.1);
        }
        
        .event-item.failure {
            border-left-color: #e74c3c;
            background: rgba(231, 76, 60, 0.1);
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: rgba(52, 73, 94, 0.8);
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #27ae60, #2ecc71);
            transition: width 0.5s ease;
        }
    </style>
</head>
<body>
    <div class="game-container">
        <div class="header">
            <h1>🏰 Po Waterloo 1815 🏰</h1>
            <p>Odbuduj Francję po klęsce pod Waterloo</p>
        </div>
        
        <div class="game-info">
            <div class="stat-card">
                <h3>Stabilność</h3>
                <div class="stat-value" id="stability">50</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="stability-bar" style="width: 50%"></div>
                </div>
            </div>
            <div class="stat-card">
                <h3>Zasoby</h3>
                <div class="stat-value" id="resources">100</div>
            </div>
            <div class="stat-card">
                <h3>Poparcie</h3>
                <div class="stat-value" id="support">30</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="support-bar" style="width: 30%"></div>
                </div>
            </div>
        </div>
        
        <div class="game-board">
            <div class="map-area">
                <h3>🗺️ Regiony Francji</h3>
                <div class="region controlled" data-region="paris">
                    <strong>🏛️ Paryż</strong><br>
                    Status: Pod kontrolą<br>
                    Garnizon: 5000 ludzi
                </div>
                <div class="region" data-region="normandy">
                    <strong>🌊 Normandia</strong><br>
                    Status: Niepewna<br>
                    Garnizon: 2000 ludzi
                </div>
                <div class="region hostile" data-region="lyon">
                    <strong>🏭 Lyon</strong><br>
                    Status: Wrogie nastroje<br>
                    Garnizon: 1000 ludzi
                </div>
                <div class="region" data-region="marseille">
                    <strong>⛵ Marsylia</strong><br>
                    Status: Neutralna<br>
                    Garnizon: 1500 ludzi
                </div>
                <div class="region hostile" data-region="bordeaux">
                    <strong>🍷 Bordeaux</strong><br>
                    Status: Opór rojalistów<br>
                    Garnizon: 800 ludzi
                </div>
            </div>
            
            <div class="actions-panel">
                <h3>⚔️ Akcje</h3>
                <button class="action-button" onclick="recruitTroops()">
                    🪖 Rekrutuj Wojsko<br>
                    <small>Koszt: 30 zasobów</small>
                </button>
                <button class="action-button" onclick="diplomacy()">
                    🤝 Dyplomacja<br>
                    <small>Koszt: 20 zasobów</small>
                </button>
                <button class="action-button" onclick="economicReform()">
                    💰 Reformy Ekonomiczne<br>
                    <small>Koszt: 40 zasobów</small>
                </button>
                <button class="action-button" onclick="militaryCampaign()">
                    ⚔️ Kampania Wojskowa<br>
                    <small>Koszt: 50 zasobów</small>
                </button>
                <button class="action-button" onclick="espionage()">
                    🕵️ Szpiegostwo<br>
                    <small>Koszt: 25 zasobów</small>
                </button>
            </div>
        </div>
        
        <div class="events-log">
            <h3>📜 Kronika Wydarzeń</h3>
            <div id="events-container">
                <div class="event-item">
                    <strong>Lipiec 1815:</strong> Napoleon abdykował. Francja w chaosie. Koalicja zbliża się do Paryża.
                </div>
                <div class="event-item">
                    <strong>Początek gry:</strong> Przejmujesz kontrolę nad resztkami francuskiego rządu. Odbuduj kraj!
                </div>
            </div>
        </div>
    </div>

    <script>
        let gameState = {
            stability: 50,
            resources: 100,
            support: 30,
            turn: 1,
            regions: {
                paris: { controlled: true, garrison: 5000, hostility: 0 },
                normandy: { controlled: false, garrison: 2000, hostility: 3 },
                lyon: { controlled: false, garrison: 1000, hostility: 7 },
                marseille: { controlled: false, garrison: 1500, hostility: 5 },
                bordeaux: { controlled: false, garrison: 800, hostility: 8 }
            }
        };

        function updateDisplay() {
            document.getElementById('stability').textContent = gameState.stability;
            document.getElementById('resources').textContent = gameState.resources;
            document.getElementById('support').textContent = gameState.support;
            
            document.getElementById('stability-bar').style.width = gameState.stability + '%';
            document.getElementById('support-bar').style.width = gameState.support + '%';
            
            // Update region colors
            Object.keys(gameState.regions).forEach(regionName => {
                const region = document.querySelector(`[data-region="${regionName}"]`);
                const regionData = gameState.regions[regionName];
                
                region.className = 'region';
                if (regionData.controlled) {
                    region.className += ' controlled';
                } else if (regionData.hostility > 6) {
                    region.className += ' hostile';
                }
            });
        }

        function addEvent(message, type = 'normal') {
            const container = document.getElementById('events-container');
            const eventDiv = document.createElement('div');
            eventDiv.className = `event-item ${type}`;
            eventDiv.innerHTML = `<strong>Tura ${gameState.turn}:</strong> ${message}`;
            container.insertBefore(eventDiv, container.firstChild);
            
            if (container.children.length > 10) {
                container.removeChild(container.lastChild);
            }
        }

        function recruitTroops() {
            if (gameState.resources < 30) {
                addEvent('Brak zasobów na rekrutację!', 'failure');
                return;
            }
            
            gameState.resources -= 30;
            gameState.stability += 5;
            gameState.regions.paris.garrison += 2000;
            
            addEvent('Zrekrutowano 2000 nowych żołnierzy w Paryżu.', 'success');
            updateDisplay();
            nextTurn();
        }

        function diplomacy() {
            if (gameState.resources < 20) {
                addEvent('Brak zasobów na dyplomację!', 'failure');
                return;
            }
            
            gameState.resources -= 20;
            gameState.support += 10;
            
            const regions = Object.keys(gameState.regions);
            const randomRegion = regions[Math.floor(Math.random() * regions.length)];
            gameState.regions[randomRegion].hostility = Math.max(0, gameState.regions[randomRegion].hostility - 2);
            
            addEvent(`Udane rokowania zmniejszyły napięcie w regionie ${randomRegion}.`, 'success');
            updateDisplay();
            nextTurn();
        }

        function economicReform() {
            if (gameState.resources < 40) {
                addEvent('Brak zasobów na reformy!', 'failure');
                return;
            }
            
            gameState.resources -= 40;
            gameState.stability += 10;
            gameState.support += 15;
            
            setTimeout(() => {
                gameState.resources += 60;
                addEvent('Reformy ekonomiczne zaczęły przynosić owoce!', 'success');
                updateDisplay();
            }, 2000);
            
            addEvent('Wprowadzono reformy ekonomiczne. Efekty będą widoczne wkrótce.', 'success');
            updateDisplay();
            nextTurn();
        }

        function militaryCampaign() {
            if (gameState.resources < 50) {
                addEvent('Brak zasobów na kampanię wojskową!', 'failure');
                return;
            }
            
            gameState.resources -= 50;
            
            const hostileRegions = Object.keys(gameState.regions).filter(r => 
                !gameState.regions[r].controlled && gameState.regions[r].hostility > 5
            );
            
            if (hostileRegions.length > 0) {
                const target = hostileRegions[Math.floor(Math.random() * hostileRegions.length)];
                const success = Math.random() > 0.4;
                
                if (success) {
                    gameState.regions[target].controlled = true;
                    gameState.regions[target].hostility = 0;
                    gameState.stability += 15;
                    addEvent(`Kampania wojskowa zakończyła się sukcesem! Przejęto kontrolę nad ${target}.`, 'success');
                } else {
                    gameState.stability -= 10;
                    gameState.support -= 5;
                    addEvent(`Kampania wojskowa w ${target} zakończyła się niepowodzeniem.`, 'failure');
                }
            } else {
                addEvent('Brak odpowiednich celów do kampanii wojskowej.', 'failure');
            }
            
            updateDisplay();
            nextTurn();
        }

        function espionage() {
            if (gameState.resources < 25) {
                addEvent('Brak zasobów na szpiegostwo!', 'failure');
                return;
            }
            
            gameState.resources -= 25;
            
            const events = [
                'Szpiedzy donoszą o planach rojalistów w Bordeaux.',
                'Przejęto korespondencję wroga - zdobyto cenne informacje.',
                'Sieć szpiegowska została częściowo zdemaskowana.',
                'Udało się przekupić kilku oficerów przeciwnika.',
                'Szpiedzy infiltrowali organizację oporu w Lyon.'
            ];
            
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            addEvent(randomEvent, 'success');
            
            gameState.stability += 3;
            gameState.support += 5;
            
            updateDisplay();
            nextTurn();
        }

        function nextTurn() {
            gameState.turn++;
            
            // Random events
            if (Math.random() < 0.3) {
                const randomEvents = [
                    'Pojawily się plotki o powrocie Napoleona.',
                    'Koalicja naciska na dalsze ustępstwa.',
                    'Wybuchły rozruchy w jednym z miast.',
                    'Otrzymano wsparcie od lokalnych notabli.',
                    'Pogorszyła się sytuacja ekonomiczna.'
                ];
                
                const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
                addEvent(event);
            }
            
            // Resource generation
            gameState.resources += 15;
            
            // Check win/lose conditions
            if (gameState.stability <= 0) {
                addEvent('Rząd upadł! Francja pogrąża się w chaosie!', 'failure');
                alert('Przegrałeś! Francja upadła w chaos.');
                location.reload();
            }
            
            const controlledRegions = Object.values(gameState.regions).filter(r => r.controlled).length;
            if (controlledRegions === 5 && gameState.support >= 70) {
                addEvent('Francja została zjednoczona! Jesteś bohaterem narodu!', 'success');
                alert('Wygrałeś! Udało Ci się odbudować Francję!');
            }
        }

        // Initialize game
        updateDisplay();
    </script>
</body>
</html>