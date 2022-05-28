/**
 * Socket Controller
 */

const debug = require("debug")("battleships:socket_controller");
let io = null; // socket.io server instance

let players = [];
let games = [];
let game = 1;

/**
 * Handle a player joined
 *
 */
const handlePlayerJoined = function (username) {
	debug(`${username} with id ${this.id} joined the game `);

	if (players.length === 0) {
		const playerOne = {
			id: this.id,
			username: username,
			turn: true,
		};
		players.push(playerOne);
		this.join(game);
		io.to(game).emit("players:profiles", players);
		debug(`${username} with id ${this.id} joined room ${game} `);
	} else if (players.length === 1) {
		// creating player profile
		const playerTwo = {
			id: this.id,
			username: username,
			turn: false,
		};
		players.push(playerTwo);
		this.join(game);
		io.to(game).emit("players:profiles", players);
		debug(`${username} with id ${this.id} joined room ${game} `);
	}
	if (players.length === 2) {
		players = [];
		game++;
	}
	games.push(game);
};

/**
 * Handle a player disconnecting
 *
 */
const handleDisconnect = function () {
	debug(`Client ${this.id} disconnected :(`);

	const removePlayer = (id) => {
		const removeIndex = players.findIndex((player) => player.id === id);

		if (removeIndex !== -1) return players.splice(removeIndex, 1)[0];
	};

	const player = removePlayer(this.id);
	if (player) io.to(player.room).emit("player:disconnected", true);
};

/**
 * Handle shot fired
 *
 */
const handleShotFired = function (target) {
	console.log(`User shot at ${target}`);
	this.broadcast.emit("player:fire", target);
};

/**
 * Handle shot reply
 *
 */
const handleShotReply = function (id, boolean) {
	console.log(`Shot replied at ${id} and it's ${boolean}`);
	this.broadcast.emit("player:shot-received", id, boolean);
};

/**
 * Handle shot reply
 *
 */
const handleSunkenShip = function (id) {
	this.broadcast.emit("player:ship-sunken-reply", id);
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
	socket.on("player:joined", handlePlayerJoined);

	// Handle shot fired
	socket.on("player:shot-fired", handleShotFired);

	// Handle shot replied
	socket.on("player:shot-reply", handleShotReply);

	// Handle enemy ship sunken
	socket.on("player:ship-sunken", handleSunkenShip);
};
