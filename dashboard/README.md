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

## Firmware Configuration

The NerdMiner firmware has been modified to broadcast stats to `255.255.255.255` on port `33333` via UDP.
Ensure your miners and this computer are on the same network/subnet. you can then expose this via Tailscail

![Dashboard example image](https://github.com/WeisTekEng/NerdMiner_v2/blob/dashboard/dashboard/Dashboard.PNG)

![Dashboard example image](https://github.com/WeisTekEng/NerdMiner_v2/blob/dashboard/dashboard/Dashboard2.PNG)
