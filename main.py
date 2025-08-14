from flask import Flask, render_template, request, redirect, url_for, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)

# Daftar lomba yang tersedia
COMPETITIONS = [
    "Makan Kerupuk",
    "Esport ML", 
    "Sarung Smash",
    "Masak",
    "Balap Karung",
    "Tarik Tambang",
    "Panjat Pinang",
    "Lomba Minum",
    "Fashion Show",
    "Menyanyi",
    "Dance",
    "Drama"
]

# Inisialisasi database
def init_db():
    conn = sqlite3.connect('leaderboard.db')
    cursor = conn.cursor()
    
    # Tabel untuk pemenang (tidak perlu tabel competitions terpisah)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS winners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            competition_name TEXT NOT NULL,
            name TEXT NOT NULL,
            position INTEGER,
            class_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Route untuk halaman utama
@app.route('/')
def index():
    conn = sqlite3.connect('leaderboard.db')
    cursor = conn.cursor()
    
    # Ambil semua pemenang berdasarkan lomba
    cursor.execute('''
        SELECT competition_name, name, position, class_name
        FROM winners
        ORDER BY competition_name, position
    ''')
    
    results = cursor.fetchall()
    
    # Organisasi data menjadi format yang mudah ditampilkan
    competitions = {}
    for row in results:
        comp_name, winner_name, position, class_name = row
        if comp_name not in competitions:
            competitions[comp_name] = []
        competitions[comp_name].append({
            'name': winner_name,
            'position': position,
            'class_name': class_name
        })
    
    # Hitung statistik TOP 5 kelas dengan juara terbanyak
    cursor.execute('''
        SELECT class_name, COUNT(*) as total_winners
        FROM winners
        GROUP BY class_name
        ORDER BY total_winners DESC
        LIMIT 5
    ''')
    
    top_classes = cursor.fetchall()
    
    conn.close()
    
    return render_template('index.html', competitions=competitions, top_classes=top_classes)

# Route untuk halaman admin
@app.route('/admin')
def admin():
    return render_template('admin.html', competitions=COMPETITIONS)

# Route untuk menambah pemenang
@app.route('/add_winners', methods=['POST'])
def add_winners():
    competition_name = request.form.get('competition')
    winners_data = request.form.getlist('winners')
    classes_data = request.form.getlist('classes')
    
    if competition_name and winners_data and competition_name in COMPETITIONS:
        conn = sqlite3.connect('leaderboard.db')
        cursor = conn.cursor()
        
        # Hapus pemenang lama untuk lomba ini
        cursor.execute('DELETE FROM winners WHERE competition_name = ?', (competition_name,))
        
        # Tambahkan pemenang baru
        for i, winner_name in enumerate(winners_data):
            if winner_name.strip():
                class_name = classes_data[i] if i < len(classes_data) else 'Tidak Diketahui'
                cursor.execute('''
                    INSERT INTO winners (competition_name, name, position, class_name)
                    VALUES (?, ?, ?, ?)
                ''', (competition_name, winner_name.strip(), i + 1, class_name))
        
        conn.commit()
        conn.close()
    
    return redirect(url_for('admin'))

# API untuk mendapatkan daftar lomba (untuk JavaScript)
@app.route('/api/competitions')
def api_competitions():
    return jsonify(COMPETITIONS)

if __name__ == '__main__':
    init_db()
    app.run(debug=True)