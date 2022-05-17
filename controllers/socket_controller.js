/**
 * Socket Controller
 */

const debug = require('debug')('battleships:socket_controller');
let io = null; // socket.io server instance

const players = [];
const room = [];

/**
 * Handle a player joined
 *
 */
const handlePlayerJoined = function (username) {
	debug(`${username} connected with id ${this.id} wants to join`);
	console.log('How many players in the begining', players);

	if (players.length > 1) {
		console.log('Room is full');
		this.emit('game:full', true, (playersArray) => {
			playersArray = players;
		});
		return;
	}

	const player = {
		id: this.id,
		username: username,
	};

	players.push(player);

	// Sending oppponent name
	this.broadcast.emit('username', player.username);
};

/**
 * Handle a player disconnecting
 *
 */
const handleDisconnect = function () {
	debug(`Client ${this.id} disconnected :(`);

	const playerLeaving = players.find((x) => x.id === this.id);

	if (playerLeaving) {
		const leavingPlayerName = players.find((x) => x.id === this.id).username;

		if (leavingPlayerName) {
			const playerIndex = players.findIndex((x) => x.id === this.id);
			players.splice(playerIndex, 1);

			this.broadcast.emit('player:disconnected', true);
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
	socket.on('disconnect', handleDisconnect);

	// handle username
	socket.on('player:username', handlePlayerJoined);
};
