/**
 * Socket Controller
 */

const debug = require('debug')('battleships:socket_controller');
let io = null; // socket.io server instance

const players = [];

/**
 * Handle a player joined
 *
 */
const handlePlayerJoined = function (username) {
	debug(`${username} connected with id ${this.id} wants to join`);

	const player = {
		id: this.id,
		username: username,
		ready: false,
		ships: {},
	};

	players.push(player);

	console.log(players);

	// Let new player join a room.

	// If there's more than 2 players in same room emit to waiting page
};

/**
 * Handle when player is ready
 *
 */

/**
 * Create battle board and emit with ship locations
 *
 */

/**
 * Handle hit and miss
 *
 */

/**
 * Handle a player disconnecting
 *
 */
const handleDisconnect = function () {
	debug(`Client ${this.id} disconnected :(`);
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
