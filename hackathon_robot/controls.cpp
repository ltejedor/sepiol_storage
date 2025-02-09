#include <ESP32Servo.h>

Servo servo1, servo2, servo3, servo4;  // Create servo objects

const int servoPins[] = {14, 37, 27, 13};  // Servo signal pins
Servo* servos[] = {&servo1, &servo2, &servo3, &servo4};  // Servo object references

void setup() {
    for (int i = 0; i < 4; i++) {
        servos[i]->attach(servoPins[i]);  // Attach each servo to its designated pin
    }
}

void loop() {
    for (int i = 0; i < 4; i++) {
        // Sweep from 0 to 180 degrees
        for (int pos = 0; pos <= 180; pos += 5) {
            servos[i]->write(pos);
            delay(20);
        }

        // Sweep from 180 to 0 degrees
        for (int pos = 180; pos >= 0; pos -= 5) {
            servos[i]->write(pos);
            delay(20);
        }
    }
}
