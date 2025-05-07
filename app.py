from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS

# Load the SVM model and scaler
svm_model = joblib.load('svm_model.pkl')
scaler = joblib.load('scaler.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        # Define the expected columns
        input_data = pd.DataFrame([data], columns=[
            'Hours_Studied', 'Attendance', 'Parental_Involvement', 'Access_to_Resources',
            'Extracurricular_Activities', 'Sleep_Hours', 'Previous_Scores', 'Motivation_Level',
            'Internet_Access', 'Tutoring_Sessions', 'Family_Income', 'Teacher_Quality',
            'School_Type', 'Peer_Influence', 'Physical_Activity', 'Learning_Disabilities',
            'Parental_Education_Level', 'Distance_from_Home', 'Gender'
        ])

        # Define categorical columns
        categorical_columns = [
            'Parental_Involvement', 'Access_to_Resources', 'Extracurricular_Activities',
            'Motivation_Level', 'Internet_Access', 'Family_Income', 'Teacher_Quality',
            'School_Type', 'Peer_Influence', 'Learning_Disabilities', 'Parental_Education_Level',
            'Distance_from_Home', 'Gender'
        ]

        # Apply one-hot encoding to categorical columns
        input_data_encoded = pd.get_dummies(input_data, columns=categorical_columns)

        # Load the training feature names (you may need to save these during training)
        # For now, assume you know the expected columns or check scaler.feature_names_in_
        expected_columns = scaler.feature_names_in_  # Requires scikit-learn >= 1.0

        # Ensure the input data has all expected columns, fill missing ones with 0
        missing_cols = [col for col in expected_columns if col not in input_data_encoded.columns]
        for col in missing_cols:
            input_data_encoded[col] = 0

        # Reorder columns to match the training set
        input_data_encoded = input_data_encoded[expected_columns]

        # Scale the input data
        input_data_scaled = scaler.transform(input_data_encoded)

        # Make predictions
        prediction = svm_model.predict(input_data_scaled)[0]
        prediction_proba = svm_model.predict_proba(input_data_scaled)[0]

        return jsonify({
            'prediction': int(prediction),
            'probability': prediction_proba.tolist()
        })
    except Exception as e:
        print(f"Error: {str(e)}")  # Log error for debugging
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)