from flask import Flask, render_template, jsonify
import psutil
import time
from threading import Thread

app = Flask(__name__)

metrics = {
    "cpu": 0.0,
    "ram_used": 0.0,
    "ram_total": 0.0,
    "disk_used": 0,
    "disk_total": 0,
    "net_sent": 0.0,
    "net_recv": 0.0,
    "packets_sent": 0,
    "packets_recv": 0
}

prev_net_io = psutil.net_io_counters()

def collect_system_data():
    global prev_net_io
    
    while True:
        # === CPU ===
        cpu = psutil.cpu_percent(interval=1)
        
        # === RAM ===
        ram = psutil.virtual_memory()
        ram_used = round(ram.used / (1024**3), 2)
        ram_total = round(ram.total / (1024**3), 2)
        
        # === Disk ===
        disk = psutil.disk_usage('/')
        disk_used = round(disk.used / (1024**3), 2)
        disk_total = round(disk.total / (1024**3), 2)
        
        # === Network ===
        current_net_io = psutil.net_io_counters()
        sent_delta = (current_net_io.bytes_sent - prev_net_io.bytes_sent) / 1024  # KB
        recv_delta = (current_net_io.bytes_recv - prev_net_io.bytes_recv) / 1024  # KB
        
        # Update metrics
        metrics.update({
            "cpu": cpu,
            "ram_used": ram_used,
            "ram_total": ram_total,
            "disk_used": disk_used,
            "disk_total": disk_total,
            "net_sent": round(sent_delta, 2),
            "net_recv": round(recv_delta, 2),
            "packets_sent": current_net_io.packets_sent - prev_net_io.packets_sent,
            "packets_recv": current_net_io.packets_recv - prev_net_io.packets_recv
        })
        
        # Update previous network values
        prev_net_io = current_net_io
        
        time.sleep(2)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data')
def get_data():
    return jsonify(metrics)

if __name__ == '__main__':
    Thread(target=collect_system_data, daemon=True).start()
    app.run(host='0.0.0.0', port=5000)