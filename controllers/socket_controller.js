/**
 * Socket Controller
 */

const debug = require("debug")("battleships:socket_controller");
let io = null; // socket.io server instance

let players = [];
let games = [];

const getRoom = (playerId, games) => {
	const room = games.find((game) => game.players.id.includes(playerId));
	return room;
};

/**
 * Handle a player joined
 *
 */
const handlePlayerJoined = function (username) {
	debug(`${username} with id ${this.id} joined the game `);

	const player = {
		id: this.id,
		username: username,
		turn: players[0] ? false : true,
	};

	players.push(player);

	if (players.length > 1) {
		let game = {
			id: players[0].id,
			players: players,
		};

		games.push(game);

		this.join(game.id);

		io.to(game.id).emit("players:profiles", game.players);
		players = [];
	}
};

/**
 * Handle a player disconnecting
 *
 */
const handleDisconnect = function () {
	debug(`Client ${this.id} disconnected :(`);

	// const room = getRoom(this.id, games);

	// console.log(room);

	console.log(players);
	console.log(games);

	// const removePlayer = (id) => {
	// 	const removeIndex = players.findIndex((player) => player.id === id);

	// 	if (removeIndex !== -1) return players.splice(removeIndex, 1)[0];
	// };

	// const player = removePlayer(this.id);
	// if (player) io.to(player.room).emit("player:disconnected", true);
};

/**
 * Handle shot fired
 *
 */
const handleShotFired = function (target) {
	// console.log(`User shot at ${target}`);
	this.broadcast.emit("player:fire", target);
};

/**
 * Handle shot reply
 *
 */
const handleShotReply = function (id, boolean) {
	// console.log(`Shot replied at ${id} and it's ${boolean}`);
	this.broadcast.emit("player:shot-received", id, boolean);
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
};
