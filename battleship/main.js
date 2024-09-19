// Our Javascript File
// We need 3 Classes

// One - Model (Game Logic)
class Model {
	constructor() {
		this.boardSize = 7;
		this.numShips = 3;
		this.shipLength = 3;
		this.shipsSunk = 0;
		this.ships = Array.from({ length: this.numShips }, () => ({
			locations: Array(this.shipLength).fill(0),
			hits: Array(this.shipLength).fill(''),
		}));
	}

	fire(guess) {
		for (const ship of this.ships) {
			const index = ship.locations.indexOf(guess);
			if (ship.hits[index] === 'hit') {
				View.displayMessage('Oops, you already hit that location!');
				return true;
			} else if (index >= 0) {
				ship.hits[index] = 'hit';
				View.displayHit(guess);
				View.displayMessage('HIT!');

				if (this.isSunk(ship)) {
					View.displayMessage('You sank my battleship!');
					this.shipsSunk++;
				}

				return true;
			}
		}
		View.displayMiss(guess);
		View.displayMessage('You Missed!');
		return false;
	}

	isSunk(ship) {
		return ship.hits.every((hit) => hit === 'hit');
	}

	generateShipLocations() {
		for (let i = 0; i < this.numShips; i++) {
			let locations;
			do {
				locations = this.generateShip();
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
		console.log('Ships array:', this.ships);
	}

	generateShip() {
		const direction = Math.random() < 0.5;
		const row = direction
			? Math.floor(Math.random() * this.boardSize)
			: Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));

		const col = direction
			? Math.floor(Math.random() * (this.boardSize - this.shipLength + 1))
			: Math.floor(Math.random() * this.boardSize);

		return Array.from({ length: this.shipLength }, (_, i) =>
			direction ? `${row}${col + i}` : `${row + i}${col}`
		);
	}

	collision(locations) {
		return this.ships.some((ship) =>
			ship.locations.some((location) => locations.includes(location))
		);
	}
}

// Two - View (UI Messages)
class View {
	static displayMessage(msg) {
		const messageArea = document.getElementById('messageArea');
		messageArea.innerHTML = msg;
	}

	static displayHit(location) {
		const cell = document.getElementById(location);
		cell.classList.add('hit');
	}

	static displayMiss(location) {
		const cell = document.getElementById(location);
		cell.classList.add('miss');
	}
}

// Three - Controller (Inputs and Game Management)
class Controller {
	constructor() {
		this.guesses = 0;
	}

	processGuess(guess) {
		const location = parseGuess(guess);
		if (location) {
			this.guesses++;
			const hit = model.fire(location);
			if (hit && model.shipsSunk === model.numShips) {
				View.displayMessage(
					`You sank all my ships, in ${this.guesses} guesses!`
				);
			}
		}
	}
}

// Helper Functions & Event Handlers
function parseGuess(guess) {
	// these represent rows on the game board
	const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
	if (!guess || guess.length !== 2) {
		alert('You must enter a letter and a number on the board!');
		return null;
	}

	const row = alphabet.indexOf(guess.charAt(0).toUpperCase());
	const column = Number(guess.charAt(1));

	if (row === -1 || isNaN(column)) {
		alert('Nope, that is not on the board!');
	} else if (
		row < 0 ||
		row >= model.boardSize ||
		column < 0 ||
		column >= model.boardSize
	) {
		alert('That is not on the board!');
	} else {
		return `${row}${column}`;
	}
	return null;
}

function handleFireButton() {
	const guessInput = document.getElementById('guessInput');
	const guess = guessInput.value.toUpperCase();
	controller.processGuess(guess);
	guessInput.value = '';
}

function handleKeyPress(e) {
	if (e.key === 'Enter') {
		document.getElementById('fireButton').click();
		return false;
	}
}

// Init Function
function init() {
	document.getElementById('fireButton').onclick = handleFireButton;
	document.getElementById('guessInput').onkeypress = handleKeyPress;
	model.generateShipLocations();
}

const model = new Model();
const controller = new Controller();
window.onload = init;
