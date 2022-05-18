/**
 * Socket Controller
 */

const debug = require("debug")("battleships:socket_controller");
let io = null; // socket.io server instance

let players = [];

/**
 * Handle a player joined
 *
 */
const handlePlayerJoined = function (username) {
	console.log("How many players are there now", players);
	debug(`${username} connected with id ${this.id} wants to join`);

	if (players.length <= 1) {
		// creating player profile
		const player = {
			id: this.id,
			username: username,
		};

		players.push(player);
		console.log("how many players inside IF?", players);

		// Sending oppponent name
		this.broadcast.emit("username", player.username);
	} else {
		// if room is full
		console.log("Room is full");
		console.log(
			"This room is full but how many are in this players array?",
			players
		);
		// delete this.id;
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

	if (players.length === 1) {
		players = [];
	}
};

/**
 * Handle hit
 *
 */
const handleHit = function (target) {
	debug(`Player shot at ${target} and hit`);
};

/**
 * Handle miss
 *
 */
const handleMiss = function (target) {
	debug(`Player shot at ${target} and missed`);
};

/**
 * Export controller and attach handlers to events
 *
 */
module.exports = function (socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	debug(`Client ${socket.id} connected`);

	// handle player disconnect
	socket.on("disconnect", handleDisconnect);

	// handle username
	socket.on("player:username", handlePlayerJoined);

	// Handle hit
	socket.on("player:hit", handleHit);

	// Handle miss
	socket.on("player:miss", handleMiss);
};
