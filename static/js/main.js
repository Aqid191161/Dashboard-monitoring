// Initialize charts
const cpuChart = new Chart(document.getElementById('cpuChart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'CPU Usage (%)',
            data: [],
            borderColor: '#2c7be5',
            backgroundColor: 'rgba(44, 123, 229, 0.2)',
            borderWidth: 2,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                enabled: true
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    }
});

const netChart = new Chart(document.getElementById('netChart'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            {
                label: 'Upload',
                data: [],
                borderColor: '#00bcd4',
                borderWidth: 2
            },
            {
                label: 'Download',
                data: [],
                borderColor: '#00d97e',
                borderWidth: 2
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                enabled: true
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

const diskChart = new Chart(document.getElementById('diskChart'), {
    type: 'doughnut',
    data: {
        labels: ['Used', 'Free'],
        datasets: [{
            label: 'Disk Usage',
            data: [],
            backgroundColor: ['#00d97e', '#e0e0e0'],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }
});

// Update data function
async function updateData() {
    const response = await fetch('/data');
    const data = await response.json();
    
    // Update metrics cards
    document.getElementById('cpuValue').textContent = `${data.cpu}%`;
    document.getElementById('ramValue').textContent = `${data.ram_used} / ${data.ram_total} GB`;
    document.getElementById('diskValue').textContent = `${data.disk_used} / ${data.disk_total} GB`;
    document.getElementById('netSent').textContent = data.net_sent;
    document.getElementById('netRecv').textContent = data.net_recv;
    document.getElementById('netValue').textContent = 
        `${(data.net_sent + data.net_recv).toFixed(2)} KB/s`;
    
    // Update CPU chart
    if (cpuChart.data.labels.length >= 10) {
        cpuChart.data.labels.shift();
        cpuChart.data.datasets[0].data.shift();
    }
    cpuChart.data.labels.push(new Date().toLocaleTimeString());
    cpuChart.data.datasets[0].data.push(data.cpu);
    cpuChart.update();
    
    // Update Network chart
    if (netChart.data.labels.length >= 10) {
        netChart.data.labels.shift();
        netChart.data.datasets[0].data.shift();
        netChart.data.datasets[1].data.shift();
    }
    netChart.data.labels.push(new Date().toLocaleTimeString());
    netChart.data.datasets[0].data.push(data.net_sent);
    netChart.data.datasets[1].data.push(data.net_recv);
    netChart.update();
    
    // Update Disk chart
    const diskFree = data.disk_total - data.disk_used;
    diskChart.data.datasets[0].data = [data.disk_used, diskFree];
    diskChart.update();
}

// Initial load and interval
updateData();
setInterval(updateData, 5000);