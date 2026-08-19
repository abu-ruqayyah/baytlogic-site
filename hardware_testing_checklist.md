# Hardware Testing and Verification Checklist

This manual details the step-by-step verification procedures for each sensor and actuator in the **BaytLogic Sentinel v2** edge node node. This serves as verification testing material for the experimental results chapter.

---

## 1. Node GPIO Pin Reference (ESP32 DevKit V1)

| Component | Pin Number | Pin Type | MQTT Telemetry Key | Trigger Condition |
| --- | :---: | :---: | :---: | :---: |
| **PIR Motion Sensor** | GPIO 14 | Digital Input | `pir_triggered` | `1` (Motion), `0` (Idle) |
| **Reed Switch (Door)** | GPIO 12 | Digital Input | `door_open` | `1` (Open), `0` (Closed) |
| **DHT22 Temp & Humidity** | GPIO 27 | Digital Input (1-Wire)| `temperature`, `humidity` | Continuous floating values |
| **MQ-2 Smoke/Gas Sensor** | GPIO 34 | Analog Input | `smoke_level`, `gas_level` | Higher ppm on gas release |
| **HC-SR04 Ultrasonic** | Trig: 26 / Echo: 25 | Digital I/O | `ultrasonic_distance` | Proximity range in cm |
| **Active Buzzer** | GPIO 13 | Digital Output | N/A | High on intrusion/safety event |
| **Power Relay Actuator** | GPIO 15 | Digital Output | N/A | High on critical alarm |
| **RGB LED** | R: 18 / G: 19 / B: 21| Digital Output | N/A | Visual status indicator |

---

## 2. Global Verification Setup

Before testing individual sensors, open a terminal on your Raspberry Pi (or PC) to monitor the raw MQTT broker telemetry:

```bash
# Monitor all telemetry events on the gateway broker
mosquitto_sub -h localhost -p 1883 -t "baytlogic/nodes/+/telemetry" -u esp32_sensor_node_1 -P HashVerifiedPasswordSecure -v
```

---

## 3. Sensor Testing Checklists

### ☐ 1. PIR Motion Sensor (GPIO 14)
* **Testing Procedure**: 
  1. Leave the room/area for 15 seconds until the ESP32 status reports `pir_triggered: 0`.
  2. Wave your hand directly in front of the PIR sensor dome.
* **Expected Output**: 
  * Telemetry JSON packet shows `"pir_triggered": 1`.
  * RGB LED turns **Amber** (Warning state) if the system is armed.
  * Local console logs: `PIR sensor triggered: Motion detected`.

---

### ☐ 2. DHT22 Temperature & Humidity Sensor (GPIO 27)
* **Testing Procedure**:
  1. Verify active values on startup.
  2. Lightly blow warm air onto the DHT22 grill.
* **Expected Output**:
  * Telemetry reports temperature and humidity floating values:
    ```json
    "temperature": 24.50, "humidity": 45.20
    ```
  * Temperature and humidity values increase in the next telemetry interval (typically every 3 seconds).

---

### ☐ 3. MQ-2 Smoke and Gas Sensor (GPIO 34)
* **Testing Procedure**:
  1. Hold an unlit butane gas lighter close to the MQ-2 sensor mesh and release a small amount of gas (or blow smoke).
* **Expected Output**:
  * `"gas_level"` and `"smoke_level"` values increase (typically jumping from baseline $<50$ to $>400$ ppm).
  * If MQ-2 levels cross safety thresholds (e.g. gas $>500$ ppm):
    * The **Buzzer** sounds continuously.
    * The **Relay** clicks on (opens safety exhaust fan).
    * MQTT publishes a critical safety event.

---

### ☐ 4. HC-SR04 Ultrasonic Distance Sensor (GPIO 26, 25)
* **Testing Procedure**:
  1. Place an object (e.g., a card or your hand) at distances of 10cm, 50cm, and 100cm from the sensor eyes.
* **Expected Output**:
  * `"ultrasonic_distance"` matches physical measurements within $\pm1\text{ cm}$.
  * If distance drops below threshold (e.g., $<30\text{ cm}$) while system is armed:
    * Intrusion trigger is flagged.

---

### ☐ 5. Door Reed Switch (GPIO 12)
* **Testing Procedure**:
  1. Bring the permanent magnet close to the reed switch (closed state).
  2. Pull the magnet away (open state).
* **Expected Output**:
  * Magnets touching: `"door_open": 0`.
  * Magnets separated: `"door_open": 1`.
  * Transition to `1` triggers an instant alarm warning.

---

## 4. Actuator Testing Checklists

### ☐ 6. Active Alarm Buzzer (GPIO 13)
* **Testing Procedure**:
  1. Arm the system and trigger the PIR or Reed Switch.
  2. Alternatively, trigger the MQ-2 sensor with butane gas.
* **Expected Output**:
  * Buzzer sounds high-pitch tone.
  * Turn off siren by publishing disarm MQTT command:
    ```bash
    mosquitto_pub -h localhost -t "baytlogic/gateway/command" -m '{"command":"DISARM"}' -u esp32_sensor_node_1 -P HashVerifiedPasswordSecure
    ```

---

### ☐ 7. RGB Status LED (GPIO 18, 19, 21)
* **Testing Procedure**:
  1. Monitor the LED color during system state changes.
* **Expected Output**:
  * **Green** (Pins: Red=Low, Green=High, Blue=Low): System is secured.
  * **Blue** (Pins: Red=Low, Green=Low, Blue=High): System is armed and monitoring.
  * **Red** (Pins: Red=High, Green=Low, Blue=Low): An active alarm has been triggered.

---

### ☐ 8. Power Relay Actuator (GPIO 15)
* **Testing Procedure**:
  1. Trigger a critical gas leak safety hazard.
* **Expected Output**:
  * Relays clicks audibly.
  * Multimeter shows continuity across normally-open (NO) contacts (simulating automatic activation of exhaust fans).
