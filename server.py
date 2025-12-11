from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

API_KEY = "84ff7bc9c3f245da7c50835f162bd6f3"

@app.route('/')
def home():
    return "<h1>Server Meteo Attivo ✅</h1>"

@app.route('/meteo')
def meteo():
    city = request.args.get('city', 'Roma')
    
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city},IT&appid={API_KEY}&units=metric&lang=it"
        response = requests.get(url)
        data = response.json()
        
        if response.status_code != 200:
            return jsonify({"errore": "Città non trovata"}), 404
            
        return jsonify({
            "città": data['name'],
            "paese": data['sys']['country'],
            "temperatura": round(data['main']['temp']),
            "temp_percepita": round(data['main']['feels_like']),
            "descrizione": data['weather'][0]['description'].title(),
            "icona": data['weather'][0]['icon'],
            "umidità": data['main']['humidity'],
            "vento": round(data['wind']['speed'] * 3.6),
            "ora_richiesta": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "previsioni": [
                {"ora": "12:00", "temp": round(data['main']['temp']), "icona": data['weather'][0]['icon']},
                {"ora": "15:00", "temp": round(data['main']['temp']+2), "icona": data['weather'][0]['icon']},
                {"ora": "18:00", "temp": round(data['main']['temp']-1), "icona": data['weather'][0]['icon']},
                {"ora": "21:00", "temp": round(data['main']['temp']-3), "icona": data['weather'][0]['icon']},
                {"ora": "00:00", "temp": round(data['main']['temp']-5), "icona": data['weather'][0]['icon']}
            ]
        })
        
    except Exception as e:
        print(f"Errore: {e}")
        return jsonify({"errore": str(e)}), 500

if __name__ == '__main__':
    print("🚀 SERVER METEO SEMPLICE AVVIATO SU http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)