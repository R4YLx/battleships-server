/**
 * Socket Controller
 */

const debug = require("debug")("battleships:socket_controller");
let io = null; // socket.io server instance

let players = [];
let games = [];

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
			id: "game-" + players[0].id,
			players,
		};

		games.push(game);

		this.join(game.id);

		io.to(game.id).emit("players:profiles", game.players);
		players = [];
	} else {
		this.join("game-" + this.id);
	}
	console.log("Games when joined", games);
};

/**
 * Handle a player disconnecting
 *
 */
const handleDisconnect = function () {
	debug(`Client ${this.id} disconnected :(`);
	// finds game id for room where players are in
	const game = games.find((game) => {
		const playerInGame = game.players.some((player) => player.id === this.id);

		if (playerInGame) return game;
	});

	// removes disconnecting player from "players"-array in "game"
	const removePlayer = (id) => {
		const removeIndex = game.players.findIndex((player) => player.id === id);

		if (removeIndex !== -1) return game.players.splice(removeIndex, 1)[0];
	};

	// removes "game" in "games"- array
	const removeGameRoom = (id) => {
		const removeGameIndex = games.findIndex((emptyGame) => emptyGame.id === id);

		if (removeGameIndex !== -1) return games.splice(removeGameIndex, 1)[0];
	};

	if (game) {
		removePlayer(this.id);

		if (game.players.length === 0) {
			removeGameRoom(game.id);
		}

		io.to(game.id).emit("player:disconnected", true);
	}
};

/**
 * Handle shot fired
 *
 */
const handleShotFired = function (target) {
	// finds game id for room where players are in
	const game = games.find((game) => {
		const playerInGame = game.players.some((player) => player.id === this.id);

		if (playerInGame) return game;
	});

	if (game) {
		this.broadcast.to(game.id).emit("player:fire", target);
	}
};

/**
 * Handle shot reply
 *
 */
const handleShotReply = function (id, boolean) {
	// finds game id for room where players are in
	const game = games.find((game) => {
		const playerInGame = game.players.some((player) => player.id === this.id);

		if (playerInGame) return game;
	});

	if (game) {
		this.broadcast.to(game.id).emit("player:shot-received", id, boolean);
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

	// Handle shot replied
	socket.on("player:shot-reply", handleShotReply);
};
