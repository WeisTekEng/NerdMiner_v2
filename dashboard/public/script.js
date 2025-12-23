const socket = io();
const grid = document.getElementById('miners-grid');
const totalHashEl = document.getElementById('total-hashrate');

const miners = {};

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
}

function createCard(key) {
    const div = document.createElement('div');
    div.className = 'miner-card';
    div.id = `card-${key}`;
    return div;
}

function formatHashrate(strValue) {
    const val = parseFloat(strValue);
    if (isNaN(val)) return '0 <span style="font-size: 0.8rem">H/s</span>';

    if (val >= 1e18) return `${(val / 1e18).toFixed(3)} <span style="font-size: 0.8rem">ZH/s</span>`;
    if (val >= 1e15) return `${(val / 1e15).toFixed(2)} <span style="font-size: 0.8rem">EH/s</span>`;
    if (val >= 1e12) return `${(val / 1e12).toFixed(2)} <span style="font-size: 0.8rem">PH/s</span>`;
    if (val >= 1e9) return `${(val / 1e9).toFixed(2)} <span style="font-size: 0.8rem">TH/s</span>`;
    if (val >= 1e6) return `${(val / 1e6).toFixed(2)} <span style="font-size: 0.8rem">GH/s</span>`;
    if (val >= 1e3) return `${(val / 1e3).toFixed(2)} <span style="font-size: 0.8rem">MH/s</span>`;
    if (val >= 1) return `${val.toFixed(2)} <span style="font-size: 0.8rem">KH/s</span>`;
    return `${(val * 1000).toFixed(0)} <span style="font-size: 0.8rem">H/s</span>`;
}

function updateCardHTML(miner) {
    const tempClass = parseFloat(miner.temp) > 70 ? 'temp-high' : '';
    const displayName = (miner.miner && miner.miner !== 'Unknown') ? miner.miner : (miner.id || 'Unknown');
    const hashrateDisplay = formatHashrate(miner.hashrate);

    return `
                <div class="card-header">
                    <div>
                        <div class="miner-id">${displayName}</div>
                        <div class="miner-ip">${miner.ip}</div>
                    </div>
                    <div class="status-badge">
                        <span class="status-dot"></span> Online
                    </div>
                </div>
                <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 0.8rem; color: #94a3b8;">Pool: <span style="color: #f8fafc;">${miner.pool || 'Unknown'}</span></div>
                    ${(miner.miner && miner.miner !== 'Unknown') ? `<div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.25rem;">ID: <span style="font-family: monospace;">${miner.id}</span></div>` : ''}
                </div>
                <div class="stats-grid">
                    <div class="stat-item" style="grid-column: span 2;">
                        <span class="stat-label">Hashrate</span>
                        <span class="stat-value hashrate">${hashrateDisplay}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Valid Shares</span>
                        <span class="stat-value">${miner.valid}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Best Diff</span>
                        <span class="stat-value">${formatDifficulty(parseFloat(miner.bestDiff) || 0)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Temp</span>
                        <span class="stat-value ${tempClass}">${miner.temp}°C</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Uptime</span>
                        <span class="stat-value">${formatTime(miner.uptime)}</span>
                    </div>
                </div>
            `;
}

function render() {
    let totalHash = 0;

    // Sort miners by IP or ID
    const sortedKeys = Object.keys(miners).sort();

    sortedKeys.forEach(key => {
        const miner = miners[key];
        totalHash += parseFloat(miner.hashrate) || 0;

        let card = document.getElementById(`card-${key}`);
        if (!card) {
            card = createCard(key);
            grid.appendChild(card);
        }
        card.innerHTML = updateCardHTML(miner);
    });

    // Remove old cards
    const currentIds = new Set(sortedKeys.map(k => `card-${k}`));
    Array.from(grid.children).forEach(child => {
        if (!currentIds.has(child.id)) {
            child.remove();
        }
    });

    totalHashEl.innerHTML = `${formatHashrate(totalHash)} Total`;
}

socket.on('init_miners', (data) => {
    Object.assign(miners, data);
    render();
});

socket.on('miner_update', (data) => {
    const key = data.id || data.ip;
    miners[key] = data;
    render();
});

socket.on('miner_remove', (id) => {
    delete miners[id];
    render();
});

socket.on('bitcoin_stats', (data) => {
    document.getElementById('bitcoin-card').style.display = 'block';

    document.getElementById('btc-price').innerText = `$${data.price.toLocaleString()}`;
    document.getElementById('btc-height').innerText = data.height.toLocaleString();

    document.getElementById('btc-halving').innerText = `${data.halvingProgress}%`;
    document.getElementById('btc-halving-bar').style.width = `${data.halvingProgress}%`;

    const diffVal = data.difficulty; // Now validated
    let diffStr = diffVal.toLocaleString();
    if (diffVal > 1e12) diffStr = (diffVal / 1e12).toFixed(2) + ' T';
    document.getElementById('btc-diff').innerText = diffStr;

    // Use pre-fetched network hashrate (convert H/s to KH/s)
    document.getElementById('btc-network-hash').innerHTML = formatHashrate(data.networkHashrate / 1000);

    if (data.fees) {
        document.getElementById('btc-fees').innerHTML = `
                    <span style="color: #ef4444">${data.fees.fastestFee}</span> / 
                    <span style="color: #f7931a">${data.fees.hourFee}</span>
                `;
    }
});

// Chart.js Setup
const ctx = document.getElementById('hashrateChart').getContext('2d');
const hashrateChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Total Hashrate (KH/s)',
            data: [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { display: false },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8' }
            }
        }
    }
});

function updateGraph(history) {
    const labels = history.map(p => new Date(p.timestamp).toLocaleTimeString());
    const data = history.map(p => p.hashrate);

    hashrateChart.data.labels = labels;
    hashrateChart.data.datasets[0].data = data;
    hashrateChart.update();

    // Calculate Average
    if (data.length > 0) {
        const sum = data.reduce((a, b) => a + b, 0);
        const avg = sum / data.length;
        document.getElementById('hourly-avg').innerHTML = formatHashrate(avg);
    }
}

socket.on('init_history', (history) => {
    updateGraph(history);
});

socket.on('history_update', (point) => {
    // Add new point
    hashrateChart.data.labels.push(new Date(point.timestamp).toLocaleTimeString());
    hashrateChart.data.datasets[0].data.push(point.hashrate);

    // Limit to 1440 points (24h)
    if (hashrateChart.data.labels.length > 1440) {
        hashrateChart.data.labels.shift();
        hashrateChart.data.datasets[0].data.shift();
    }
    hashrateChart.update();

    // Re-calculate Average
    const data = hashrateChart.data.datasets[0].data;
    const sum = data.reduce((a, b) => a + b, 0);
    const avg = sum / data.length;
    document.getElementById('hourly-avg').innerHTML = formatHashrate(avg);
});

function formatDifficulty(val) {
    if (val >= 1e18) return (val / 1e18).toFixed(2) + ' E';
    if (val >= 1e15) return (val / 1e15).toFixed(2) + ' P';
    if (val >= 1e12) return (val / 1e12).toFixed(2) + ' T';
    if (val >= 1e9) return (val / 1e9).toFixed(2) + ' G';
    if (val >= 1e6) return (val / 1e6).toFixed(2) + ' M';
    if (val >= 1e3) return (val / 1e3).toFixed(2) + ' k';
    return val.toFixed(2);
}
