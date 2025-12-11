from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Abilita le richieste dal browser (HTML file)

# --- CONFIGURAZIONE API ---
API_KEY = "84ff7bc9c3f245da7c50835f162bd6f3"
BASE_URL = "http://api.openweathermap.org/data/2.5"

@app.route('/')
def home():
    return "<h1>Server Meteo Attivo ✅</h1><p>API endpoint: <a href='/meteo?city=Roma'>/meteo?city=Roma</a></p>"

@app.route('/meteo')
def meteo():
    city = request.args.get('city', 'Roma').strip()
    
    # Aggiungi IT se non specificato altro paese
    if ',' not in city:
        city = f"{city},IT"
    
    try:
        # Chiamata API per dati attuali
        current_url = f"{BASE_URL}/weather?q={city}&appid={API_KEY}&units=metric&lang=it"
        current_response = requests.get(current_url, timeout=5)
        current_data = current_response.json()
        
        if current_response.status_code != 200:
            return jsonify({"errore": "Città non trovata"}), 404
        
        # Chiamata API per previsioni orarie
        forecast_url = f"{BASE_URL}/forecast?q={city}&appid={API_KEY}&units=metric&lang=it"
        forecast_response = requests.get(forecast_url, timeout=5)
        forecast_data = forecast_response.json()
        
        # Estrazione dati attuali
        temp_attuale = round(current_data['main']['temp'], 1)
        temp_percepita = round(current_data['main']['feels_like'], 1)
        descrizione = current_data['weather'][0]['description'].title()
        icona = current_data['weather'][0]['icon']
        umidita = current_data['main']['humidity']
        vento = round(current_data['wind']['speed'] * 3.6, 1)  # m/s to km/h
        paese = current_data['sys']['country']
        
        # Previsioni prossime 5 ore
        previsioni = []
        for i in range(1, 6):
            if i < len(forecast_data['list']):
                forecast_item = forecast_data['list'][i]
                ora = datetime.fromtimestamp(forecast_item['dt']).strftime("%H:%M")
                temp = round(forecast_item['main']['temp'], 1)
                icona_prev = forecast_item['weather'][0]['icon']
                
                previsioni.append({
                    "ora": ora,
                    "temp": temp,
                    "icona": icona_prev
                })
        
        risultato = {
            "città": current_data['name'],
            "paese": paese,
            "temperatura": temp_attuale,
            "temp_percepita": temp_percepita,
            "descrizione": descrizione,
            "icona": icona,
            "umidità": umidita,
            "vento": vento,
            "ora_richiesta": datetime.now().strftime("%d/%m/%Y %H:%M"),
            "previsioni": previsioni
        }
        
        return jsonify(risultato)
        
    except requests.exceptions.RequestException:
        return jsonify({"errore": "Errore di connessione API"}), 500
    except Exception as e:
        return jsonify({"errore": "Errore interno del server"}), 500

if __name__ == '__main__':
    print("-------------------------------------------------")
    print("🚀 SERVER METEO AVVIATO SU http://localhost:5000")
    print("   Lascia questa finestra aperta.")
    print("-------------------------------------------------")
    app.run(host='0.0.0.0', port=5000, debug=True)