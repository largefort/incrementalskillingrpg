let level = 1;
let experience = 0;
let health = 100;
let resources = 0;
let enemies = [
   { name: "Goblin", health: 20, experience: 15 },
    { name: "Skeleton", health: 30, experience: 20 },
    { name: "Orc", health: 40, experience: 25 },
    { name: "Dragon", health: 100, experience: 50 },
    { name: "Demon", health: 80, experience: 45 },
    { name: "Witch", health: 25, experience: 18 },
    { name: "Troll", health: 50, experience: 30 },
    { name: "Ghost", health: 15, experience: 12 }
];
let currentEnemy = null;

// Function to save game data to IndexedDB
function saveGame() {
    const gameData = {
        level: level,
        experience: experience,
        health: health,
        resources: resources
        // Add more data to save as needed
    };

    const request = indexedDB.open('rpgGameDB', 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        const objectStore = db.createObjectStore('gameData', { keyPath: 'id', autoIncrement: true });
        objectStore.add(gameData);
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['gameData'], 'readwrite');
        const objectStore = transaction.objectStore('gameData');
        const addRequest = objectStore.add(gameData);

        addRequest.onsuccess = function() {
            console.log('Game data saved successfully!');
        };

        addRequest.onerror = function() {
            console.error('Error saving game data!');
        };
    };

    request.onerror = function() {
        console.error('Error opening database for saving!');
    };
}

// Function to load game data from IndexedDB
function loadGame() {
    const request = indexedDB.open('rpgGameDB', 1);

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['gameData'], 'readonly');
        const objectStore = transaction.objectStore('gameData');

        objectStore.openCursor().onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                level = cursor.value.level;
                experience = cursor.value.experience;
                health = cursor.value.health;
                resources = cursor.value.resources;

                // Update more variables as needed

                console.log('Game data loaded successfully!');
            }
        };
    };

    request.onerror = function() {
        console.error('Error opening database for loading!');
    };
}

function skill(skillType) {
    let skillGain = 0;

    switch (skillType) {
        case 'attack':
            skillGain = Math.floor(Math.random() * 10) + 1;
            break;
        case 'defend':
            skillGain = Math.floor(Math.random() * 5) + 1;
            break;
        case 'heal':
            const healAmount = Math.floor(Math.random() * 10) + 1;
            health = Math.min(100, health + healAmount);
            break;
    }

    experience += skillGain;

    if (experience >= 10 * level) {
        levelUp();
    }

    saveGame(); // Save game state after each action
    updateDisplay();
}

function levelUp() {
    level++;
    experience = 0;
    health = 100;
    alert(`Congratulations! You reached level ${level}!`);
}

function gather() {
    const resourceGain = Math.floor(Math.random() * 5) + 1; // Random gain between 1 and 5
    resources += resourceGain;

    saveGame(); // Save game state after each action
    updateDisplay();
}

function train() {
    if (resources >= 10) {
        resources -= 10;
        experience += 20; // Assuming training gives a fixed amount of experience
        health += 10; // Assuming training increases health by 10 points

        if (experience >= 10 * level) {
            levelUp();
        }

        saveGame(); // Save game state after each action
        updateDisplay();
    } else {
        alert("Not enough resources to train!");
    }
}

function fight() {
    if (currentEnemy) {
        const enemyDamage = Math.floor(Math.random() * 10) + 1;
        const playerDamage = Math.floor(Math.random() * 10) + 1;

        health -= enemyDamage;
        currentEnemy.health -= playerDamage;

        if (health <= 0) {
            gameOver();
        } else if (currentEnemy.health <= 0) {
            defeatEnemy();
        }
        
        saveGame(); // Save game state after each action
        updateDisplay();
    } else {
        alert("No enemy to fight. Choose an enemy first.");
    }
}

function defeatEnemy() {
    experience += currentEnemy.experience;
    currentEnemy = null;
    alert(`You defeated the ${currentEnemy.name} and gained ${currentEnemy.experience} experience!`);

    saveGame(); // Save game state after each action
    updateDisplay();
}

function spawnEnemy() {
    currentEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    document.getElementById('enemy-name').innerText = currentEnemy.name;

    saveGame(); // Save game state after each action
    updateDisplay();
}

function gameOver() {
    alert("Game over! You were defeated.");
    resetGame();
}

function resetGame() {
    level = 1;
    experience = 0;
    health = 100;
    resources = 0;
    currentEnemy = null;

    saveGame(); // Save game state after each action
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('level').innerText = level;
    document.getElementById('experience').innerText = experience;
    document.getElementById('health').innerText = health;
    document.getElementById('resources').innerText = resources;

    if (!currentEnemy) {
        spawnEnemy();
    }
}

// Call loadGame() when the page loads to load the saved game data.
loadGame();
