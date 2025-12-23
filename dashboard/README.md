# NerdMiner Dashboard

This is a local dashboard to monitor your NerdMiner fleet via UDP.

## Features

*   **Real-time Monitoring**: Live updates via UDP Broadcast (port 33333).
*   **Auto-Discovery**: Miners appear automatically when they start hashing.
*   **Detailed Stats**:
    *   Hashrate (Dynamic units: H/s, KH/s, MH/s)
    *   Miner Name (extracted from wallet address)
    *   Pool Address & Port
    *   Uptime, Temperature, Valid Shares, Best Difficulty
*   **Bitcoin Network Stats**:
    *   Real-time Price (USD)
    *   Network Hashrate & Difficulty
    *   Halving Progress Bar
    *   Block Height & Fees
*   **Fleet Performance**:
    *   **24-Hour Graph**: Real-time line chart showing total hashrate history.
    *   **24h Average**: Rolling average calculation.
    *   **Smart Formatting**: Difficulty (k, M, G, T, P, E) and Hashrate auto-scaling.
*   **Zero Configuration**: No IP setup needed on miners; just flash and run.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start the Server**:
    ```bash
    node server.js
    ```

3.  **Access Dashboard**:
    Open your browser and navigate to `http://localhost:3000`.

## Docker & Umbrel Support

You can run this dashboard as a Docker container.

### Linux / Umbrel (Recommended for Production)
```bash
docker-compose up -d --build
```
*Uses `network_mode: "host"` for proper UDP broadcast reception.*

### Windows (Testing/Development)
```bash
docker-compose -f docker-compose.windows.yml up -d --build
```
*Uses port mapping. Access at `http://localhost:3000`*

**Note:** UDP broadcasts from miners may not reach the container on Windows due to Docker's networking limitations. For full functionality, deploy on Linux/Umbrel.

### Umbrel
This app is ready for Umbrel.
1.  install Portainer from the umbrel app store
2.  Once in portainer, navigate to the environment you want to add this to, then click on "Add Container"
3.  for docker.io image, use `ocybress/nerdminer-dashboard-linux:r0.0.1`
4.  for the ports, add `3000` TCP, and `33333` UDP
5.  click "diploy the container"
6.  wait for the container to start
7.  navigate to `http://localhost:3000` to access the dashboard
8.  you can expose this via tailscail if you want to access it from other devices

## Firmware Configuration

The NerdMiner firmware has been modified to broadcast stats to `255.255.255.255` on port `33333` via UDP.
Ensure your miners and this computer are on the same network/subnet. you can then expose this via Tailscail

![Dashboard example image](https://github.com/WeisTekEng/NerdMiner_v2/blob/dashboard/dashboard/Dashboard.PNG)

![Dashboard example image](https://github.com/WeisTekEng/NerdMiner_v2/blob/dashboard/dashboard/Dashboard2.PNG)
