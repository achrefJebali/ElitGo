from flask import Flask, request, jsonify
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler
from flask_cors import CORS  # Import CORS


app = Flask(__name__)
RECOMMENDATIONS = {
    0: "Focus on core programming and software engineering fundamentals",
    1: "Strengthen cybersecurity and networking skills",
    2: "Develop AI and machine learning capabilities",
    3: "Improve web development and database management"
}
CORS(app, resources={r"/recommend": {"origins": "http://localhost:4200"}})  # Allow only Angular's origin

# Load the saved models
scaler = joblib.load('scaler2.pkl')
kmeans = joblib.load('kmeans_model.pkl')

@app.route('/recommend', methods=['POST'])
def recommend():
    # Get the input data from the request
    data = request.get_json()
    
    # Convert input data to DataFrame (assuming same columns as training data minus 'Student_ID')
    input_df = pd.DataFrame([data])
    
    # Scale the input data
    input_scaled = scaler.transform(input_df)
    
    # Predict the cluster
    cluster = kmeans.predict(input_scaled)[0]
    
    # Return the prediction
    return jsonify({'cluster': int(cluster)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)