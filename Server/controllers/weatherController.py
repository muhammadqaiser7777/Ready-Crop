from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

API_KEY = "b9f9416667caaa7dac9e6daa4dbd2092"  # Your OpenWeatherMap API key

# ✅ Define and register the route using @app.route decorator
@app.route('/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City name is required'}), 400

    # Call OpenWeatherMap API
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)

    if response.status_code != 200:
        return jsonify({'error': 'City not found'}), 404

    data = response.json()
    weather = {
        'city': data['name'],
        'temperature': data['main']['temp'],
        'description': data['weather'][0]['description'],
        'icon': data['weather'][0]['icon']
    }

    return jsonify(weather)

if __name__ == '__main__':
    app.run(debug=True)
