// require dependencies
var serialport = require("serialport");
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


////////////////////////////////////////////////////////////////////////////
//////////////// **** EXPRESS APPLICATION SETUP - Start **** ///////////////
////////////////////////////////////////////////////////////////////////////
// express app config, server index file
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
	app.use("/public", express.static(__dirname+'/public'));
});

// app accessable on port 3000
server.listen(3000, function(){
  	console.log('listening on: 3000');
});
////////////////////////////////////////////////////////////////////////////
//////////////// **** EXPRESS APPLICATION SETUP - END **** ///////////////
////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////
//////////////// **** SOCKET SETUP - START **** ////////////////////////////
////////////////////////////////////////////////////////////////////////////
// communicate with browser using sockets
io.on('connection', function(socket){
  	console.log('a user connected');
    // when the socket recieves instruction from the browser
	socket.on('updateArduino', function(playing){
		// send to function
        // which will write to serial port
		sendToArduinoSerial(playing.toString());
  	});
	socket.on('disconnect', function(){
    	console.log('user disconnected');
  	});
    socket.on('btnInstruction', function(instruction){
    	console.log(instruction);
    	rotate();
    });
});
////////////////////////////////////////////////////////////////////////////
//////////////// **** SOCKET SETUP - END **** ////////////////////////////
////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////
//////////////// **** ARDUINO SETUP - START **** ////////////////////////////
////////////////////////////////////////////////////////////////////////////
// create an instance of the SerialPort
var SerialPort = serialport.SerialPort;
var portName = process.argv[2];

// identify the arduino serial port, set the baudRade and new ever
var myPort = new SerialPort("/dev/tty.usbserial-A900cdod", {
	baudRade:9600,
	parser:serialport.parsers.readline("\r\n")
});

// establish listeners and handler functions
myPort.on('open', onPortOpen);
myPort.on('data', onData);
myPort.on('close', onClose);
myPort.on('error', onError);


var lastPotValue;
// this will serve as approximate marking point of the available light
var highestSensorValue=0;

function onPortOpen(){
    console.log("New port opened for arduino ");
}

function onData(data){
    var fields = data.split(/,/);
    var btnValue = fields[0];
    // easier to handle as a smaller value: /80
    // a value between 0-12
    var potValue = Math.floor(fields[1]/80);
    console.log(potValue);
    var sensorValue = fields[2];

    console.log("Button Value: " + btnValue);
    console.log("Potentiometers Value: " + potValue);
    console.log("Sensor Value: " + sensorValue);

    if (btnValue == 1) {
        // send instruction to client socket
        io.emit('btnInstruction', btnValue);
    }
    // compare the current sensor to highest recorded
    // if it is higher assign this highest recorded to current value
    if (sensorValue > highestSensorValue) {
        highestSensorValue = sensorValue;
    }
    // identify highest light detected
    // this will give a fair estimate to the available lighting in the room
    // if the sensor is starved of light to the point
    // where its decline is 200 less than of the highest noted value
    if (sensorValue < highestSensorValue-200) {
        // send instruction to client socket
        io.emit('sensorInstruction', sensorValue);
    }
    // if pot set to max, continue to move right
    if (potValue == 12) {
        // send instruction to client socket
        io.emit('potInstructionRight', sensorValue);
    }
    // if pot set to min, continue to move left
    else if (potValue == 0) {
        // send instruction to client socket
        io.emit('potInstructionLeft', sensorValue);
    }
    // compare current pot value to a predefined variable 'lastPotValue'
    // this checks if the Potentiometer value has been changed
    else if (potValue != lastPotValue) {
        // Potentiometer increas; move right
        if (potValue > lastPotValue) {
            // send instruction to client socket
            io.emit('potInstructionRight', sensorValue);
        }
        // Potentiometer decreas; move left
        else {
            // send instruction to client socket
            io.emit('potInstructionLeft', sensorValue);
        }
        // set the lastPotValue to the current value
        lastPotValue = potValue;
    }
}

function onClose(){
    console.log("Port is closed");
}
function onError(){
    console.log("Something went horribly wrong");
}

// write to arduino
function sendToArduinoSerial(data) {
	console.log("sending data to arduino: " + data);
	myPort.write(data);
}
////////////////////////////////////////////////////////////////////////////
//////////////// **** ARDUINO SETUP - END **** ////////////////////////////
////////////////////////////////////////////////////////////////////////////
