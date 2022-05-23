/**
 * Socket Controller
 */

const debug = require("debug")("battleships:socket_controller");
let io = null; // socket.io server instance

let players = [];
const playerOneShips = ["1", "2", "3", "4"];
const playerTwoShips = ["91", "92", "93", "94"];

/**
 * Handle a player joined
 *
 */
const handlePlayerJoined = function (username) {
	debug(`${username} with id ${this.id} joined the game `);

	if (players.length === 0) {
		const playerOne = {
			id: this.id,
			room: "game",
			username: username,
			currentPlayer: "",
		};

		this.join(playerOne.room);

		players.push(playerOne);

		// Sending oppponent name
		io.to(playerOne.room).emit("players:profiles", players);
	} else if (players.length <= 1) {
		// creating player profile
		const playerTwo = {
			id: this.id,
			room: "game",
			username: username,
		};

		this.join(playerTwo.room);

		players.push(playerTwo);

		debug("PLAYERS before emitting:", players);

		// Sending oppponent name
		io.to(playerTwo.room).emit("players:profiles", players);
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
	if (players[0].id === this.id) {
		const hit = playerTwoShips.find((coord) => coord === target);
		if (hit) {
			this.broadcast.emit("player:hit", target);
		} else {
			this.broadcast.emit("player:miss", target);
		}
	} else {
		const hit = playerOneShips.find((coord) => coord === target);
		if (hit) {
			this.broadcast.emit("player:hit", target);
		} else {
			this.broadcast.emit("player:miss", target);
		}
	}
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
};
