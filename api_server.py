from flask import Flask, request, jsonify
import pandas as pd
import joblib
from sklearn.preprocessing import StandardScaler
from flask_cors import CORS  # Import CORS


app = Flask(__name__)
CORS(app, resources={r"/recommend": {"origins": "http://localhost:4200"}})  # Allow only Angular's origin
RECOMMENDATIONS = {
    0: "Focus on core programming fundamentals and software engineering principles. Recommended courses: CS101, Algorithms & Data Structures",
    1: "Strengthen database management and web development skills. Suggested resources: SQL Masterclass, Full-Stack Web Development",
    2: "Develop expertise in AI/ML and computer vision. Recommended: Machine Learning Specialization, Advanced Python for AI",
    3: "Improve cybersecurity and networking capabilities. Suggested: Network Security Certification, Ethical Hacking Course",
    4: "Enhance operating systems knowledge and distributed systems understanding. Recommended: OS Concepts, Cloud Computing Basics"
}

# Load the saved models
scaler = joblib.load('scaler2.pkl')
kmeans = joblib.load('kmeans_model.pkl')

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        input_df = pd.DataFrame([data])
        input_scaled = scaler.transform(input_df)
        cluster = kmeans.predict(input_scaled)[0]
        
        return jsonify({
            'cluster': int(cluster),
            'recommendation': RECOMMENDATIONS.get(cluster, "Based on your scores, we recommend a balanced approach to all subjects")
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)