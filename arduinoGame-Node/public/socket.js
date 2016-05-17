var socket = io();
socket.on('browserInfo', function(info) {
});
// triggered on a state change of 'playing'
function updateArduino(playing) {
	// send instruction to the node server
	socket.emit('updateArduino', playing);
}

// when the socket recieves '...Instruction' perform function
socket.on('btnInstruction', function(instruction){
	// game logic function to rotate the piece
	rotate();
});
socket.on('sensorInstruction', function(instruction){
	// game logic function to drop the piece
	drop();
});
socket.on('potInstructionRight', function(instruction){
	// game logic function to move the piece: Right
	move(DIR.RIGHT);
});
socket.on('potInstructionLeft', function(instruction){
	// game logic function to move the piece: Left
	move(DIR.LEFT);
});
