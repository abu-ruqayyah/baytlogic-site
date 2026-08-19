# Raspberry Pi 3 Deployment & Troubleshooting Guide

This guide describes specific troubleshooting steps for deploying and maintaining the **BaytLogic Sentinel v2** framework on a hardware-constrained **Raspberry Pi 3 (1GB RAM)**.

---

## 1. Gateway Memory Optimization (1GB RAM Limits)

The Raspberry Pi 3 has a total of 1GB LPDDR2 RAM. Running multiple Python processes alongside a Dockerized MQTT broker and FastAPI can saturate memory if not properly optimized.

### Symptoms:
* SSH session slows down or disconnects.
* Containers exit randomly with exit code `137` (Out of Memory - OOM Killed).
* `dmesg | grep -i oom` shows system processes being killed.

### Mitigation Steps:
1. **Increase Swap Space**:
   By default, Raspberry Pi OS configures a very small swap size (100MB). Increase it to 1GB:
   ```bash
   # Stop swap service
   sudo dss-swap stop || sudo dphys-swapfile swapoff

   # Edit swapfile configuration
   sudo nano /etc/dphys-swapfile
   # Change CONF_SWAPSIZE=100 to CONF_SWAPSIZE=1024

   # Reinitialize swap
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   ```
2. **Limit Container Resources**:
   Ensure Docker Compose does not let any single container consume all system memory. The provided docker-compose includes resource limit boundaries for the AI inference service (which loads ONNX champion weights).

---

## 2. SQLite Concurrency & Database Locks

Since SQLite stores the entire database in a single file on the SD card, concurrent writes from the Gateway Orchestrator can cause a `database is locked` error.

### Symptoms:
* Gateway logs show error: `sqlite3.OperationalError: database is locked`.
* Alert histories or sensor telemetry fail to log intermittently.

### Mitigation Steps:
1. **Enable Write-Ahead Logging (WAL)**:
   WAL mode allows concurrent reads while a write operation is in progress, significantly reducing lock contention.
   Log into the SQLite shell inside the database folder:
   ```bash
   sqlite3 ./gateway-orchestrator/data/sentinel.db "PRAGMA journal_mode=WAL;"
   ```
2. **Increase Database Timeout**:
   The Database Manager is configured with a default connection timeout of 20 seconds. If locks persist due to slow SD card writing speeds (typical on old Class 4 cards), upgrade your SD card to a **Class 10 / U3** card to increase write throughput.

---

## 3. MQTT Broker Connection Issues & Disconnects

The ESP32 nodes and Python services depend on a persistent TCP connection to Eclipse Mosquitto.

### Symptoms:
* ESP32 Serial Monitor shows loop logs: `Attempting MQTT connection...failed, rc=-2`.
* Orchestrator logs: `Connection to MQTT Broker lost. Retrying...`

### Mitigation Steps:
1. **Verify Broker Port Accessibility**:
   Ensure the broker container is running and port 1883 is open on the Pi:
   ```bash
   sudo netstat -tlnp | grep 1883
   ```
2. **Check Pi Firewall Settings**:
   If the port is active locally but the ESP32 cannot connect, check `ufw` or `iptables` to ensure port 1883 is open to the local LAN:
   ```bash
   sudo ufw allow 1883/tcp
   ```
3. **Inspect Mosquitto Log Stream**:
   View active broker connections directly:
   ```bash
   docker logs sentinel_mqtt_broker
   ```
   If you see `Connection Refused: bad username or password`, verify that the username and passwords match between [config.h](file:///c:/Users/PC/.gemini/antigravity-ide/scratch/baytlogic-sentinel-v2/firmware/src/config.h) and `docker/mosquitto/auth/passwords.txt`.

---

## 4. Key Verification & Log Commands

Keep these commands handy for inspecting active logs:

* **View Orchestrator Decision Outputs**:
  ```bash
  docker logs -f sentinel_gateway_orchestrator
  ```
* **View AI Inference Requests**:
  ```bash
  docker logs -f sentinel_ai_service
  ```
* **View Local SQLite Database Table Sizes**:
  ```bash
  docker exec -it sentinel_gateway_orchestrator sqlite3 /app/data/sentinel.db "SELECT count(*) FROM sensor_telemetry;"
  ```
