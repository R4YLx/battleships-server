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
	debug(`${username} with id ${this.id} joined the game `);

	if (players.length <= 1) {
		// creating player profile
		const player = {
			id: this.id,
			room: "game",
			username: username,
			currentPlayer: "",
		};

		this.join(player.room);

		players.push(player);

		console.log("PLAYERS before emitting:", players);

		// Sending oppponent name
		io.to(player.room).emit("players:profiles", players);
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
	console.log(`User with id: ${this.id} shot on ${target}`);
	this.broadcast.emit("player:fire", target);
};

/**
 * Handle shot reply
 *
 */
const handleShotReply = function (target) {
	console.log(`Replying shot on ${target}`);
	this.broadcast.emit("player:fire-reveal", target);
};

/**
 * Handle hit
 *
 */
// const handleHit = function (target) {
// 	console.log(`User shot on ${target}`);

// 	// const opponent = players.find((player) => player === !socketId);

// 	// console.log(`OPPONENT IS ${opponent}`);

// 	// let hit = target.replace("e", "m");
// 	// console.log(`Enemy clicked on ${target} and on your board it is ${hit}`);

// 	// io.to("game").emit("player:hit", hit);
// };

/**
 * Handle miss
 *
 */
// const handleMiss = function (target) {
// 	console.log(`User shot on ${target}`);
// 	// let miss = target.replace("e", "m");
// 	// console.log(`Enemy clicked on ${target} and on your board it is ${miss}`);

// 	// io.to("game").emit("player:missed", miss);
// };

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

	// Handle shot reply
	socket.on("player:shot-reply", handleShotReply);

	// // Handle hit
	// socket.on("player:shot-hit", handleHit);

	// // Handle miss
	// socket.on("player:shot-miss", handleMiss);
};
