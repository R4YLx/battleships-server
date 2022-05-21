/**
 * Socket Controller
 */

const debug = require("debug")("battleships:socket_controller");
let io = null; // socket.io server instance

let players = [null, null];

// Find an available player number
//

const handlePlayerNumber = function () {
	let playerIndex = -1;
	for (const i in players) {
		if (players[i] === null) {
			playerIndex = i;
			break;
		}
	}

	// Ignore player 3
	if (playerIndex === -1) return;
};

/**
 * Handle a player joined
 *
 */
const handlePlayerJoined = function (username) {
	debug(`${username} connected with id ${this.id} wants to join`);

	if (players.length <= 1) {
		// creating player profile
		const player = {
			id: this.id,
			username: username,
		};

		players.push(player);

		// Sending oppponent name
		this.broadcast.emit("username", player.username);
	} else {
		// if room is full
		this.emit("game:full", true, (playersArray) => {
			playersArray = players;
		});

		delete this.id;
		return;
	}
};

/**
 * Handle a player disconnecting
 *
 */
const handleDisconnect = function () {
	debug(`Client ${this.id} disconnected :(`);

	if (this.id) {
		this.broadcast.emit("player:disconnected", true);
	}

	delete this.id;
	players = [];
	// if (players.length === 1) {

	// }
};

/**
 * Handle hit
 *
 */
const handleHit = function (target, username, socketId) {
	console.log("This should be socket id", socketId);

	console.log("HandleHit players", players);

	// const opponent = players.find((player) => player === !socketId);

	// console.log(`OPPONENT IS ${opponent}`);

	let hit = target.replace("e", "m");
	console.log(`Enemy clicked on ${target} and on your board it is ${hit}`);

	this.broadcast.emit("player:hit", hit);
};

/**
 * Handle miss
 *
 */
const handleMiss = function (target, username) {
	debug(`Player ${username} shot at ${target} and missed`);
	let miss = target.replace("e", "m");
	console.log(`Enemy clicked on ${target} and on your board it is ${miss}`);

	this.broadcast.emit("player:missed", miss);
};

/**
 * Export controller and attach handlers to events
 *
 */
module.exports = function (socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	debug(`Client ${socket.id} connected`);

	socket.emit("player:number", handlePlayerNumber);
	debug(`Player ${playerIndex} has connected`);

	// handle player disconnect
	socket.on("disconnect", handleDisconnect);

	// handle username
	socket.on("player:username", handlePlayerJoined);

	// Handle hit
	socket.on("player:shot-hit", handleHit);

	// Handle miss
	socket.on("player:shot-miss", handleMiss);
};
