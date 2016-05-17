// set pin numbers
// these wont change
int btnPin = 3;
int potPin = 0;
int sensorPin = 5;
int ledPin = 2;

// store the value for each
// these values will change
int btnValue = 0;
int potValue = 0;
int sensorValue = 0;
String input;


// the setup routine runs once when you press reset:
void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(9600);
  // declare the button pin as input
  pinMode(btnPin, INPUT);
  // declare the LED pin as output
  pinMode(ledPin, OUTPUT);
}

// the loop routine runs over and over again forever:
void loop() {
  
  // check for available serial and if so
  // read incomming serial data as a string
  if(Serial.available()){
    input = Serial.readString();
    // if the input returns true, the led pin will be turned on
    // otherwise the pin will be switched off
    if (input == "true"){
      // write to led pin and set to on
      digitalWrite(ledPin, HIGH);
    }
    else{
      // write to led pin and set to off
      digitalWrite(ledPin, LOW);
    }
  }
  
  // read the values of each pin
  btnValue = digitalRead(btnPin);
  potValue = analogRead(potPin);
  sensorValue = analogRead(sensorPin);
  // print the values of the each to the serial
  // seperate the values with a comma
  Serial.print(btnValue);
  Serial.print(",");
  Serial.print(potValue);
  Serial.print(",");
  Serial.print(sensorValue);
  Serial.println();
  // delay in between reads for stability
  delay(150);
}
