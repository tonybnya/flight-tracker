from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

AVIATION_STACK_API_KEY = os.getenv("AVIATION_STACK_API_KEY")
AVIATION_STACK_API_URL = os.getenv("AVIATION_STACK_API_URL")


@app.route('/api/flights/<flight_number>', methods=['GET'])
def get_flight(flight_number):
    try:
        # Mock data for testing
        if flight_number.upper() == "TEST1":
            return jsonify({
                "flight_number": "TEST1",
                "airline": "Test Airways",
                "origin": {
                    "code": "JFK",
                    "city": "New York", 
                    "timezone": "America/New_York",
                    "latitude": 40.6413,
                    "longitude": -73.7781
                },
                "destination": {
                    "code": "LHR",
                    "city": "London",
                    "timezone": "Europe/London",
                    "latitude": 51.4700,
                    "longitude": -0.4543
                },
                "start_time": "2023-10-27T10:00:00+00:00",
                "end_time": "2023-10-27T22:00:00+00:00",
                "stopovers": []
            })
        
        if flight_number.upper() == "TEST2":
             return jsonify({
                "flight_number": "TEST2",
                "airline": "Demo Airlines",
                "origin": {
                    "code": "HND",
                    "city": "Tokyo", 
                    "timezone": "Asia/Tokyo",
                    "latitude": 35.5494,
                    "longitude": 139.7798
                },
                "destination": {
                    "code": "CDG",
                    "city": "Paris",
                    "timezone": "Europe/Paris",
                    "latitude": 49.0097,
                    "longitude": 2.5479
                },
                "start_time": "2023-10-28T08:00:00+00:00",
                "end_time": "2023-10-28T20:00:00+00:00",
                "stopovers": ["DXB"]
            })

        params = {
            'access_key': AVIATION_STACK_API_KEY,
            'flight_iata': flight_number
        }
        response = requests.get(AVIATION_STACK_API_URL, params=params)
        data = response.json()

        if 'data' in data and len(data['data']) > 0:
            flight = data['data'][0]
            
            # Extract relevant information
            result = {
                "flight_number": flight['flight']['iata'],
                "airline": flight['airline']['name'],
                "origin": {
                    "code": flight['departure']['iata'],
                    "city": flight['departure']['airport'], 
                    "timezone": flight['departure']['timezone'],
                    "latitude": flight['departure'].get('latitude'), # Use .get() to avoid errors if key missing
                    "longitude": flight['departure'].get('longitude')
                },
                "destination": {
                    "code": flight['arrival']['iata'],
                    "city": flight['arrival']['airport'],
                    "timezone": flight['arrival']['timezone'],
                    "latitude": flight['arrival'].get('latitude'),
                    "longitude": flight['arrival'].get('longitude')
                },
                "start_time": flight['departure']['scheduled'],
                "end_time": flight['arrival']['scheduled'],
                "stopovers": [] # Free tier limitations make complex stopovers hard to track reliably without full route data
            }
            return jsonify(result)
        
        return jsonify({"error": "Flight not found"}), 404

    except Exception as e:
        print(f"Error fetching flight data: {e}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
