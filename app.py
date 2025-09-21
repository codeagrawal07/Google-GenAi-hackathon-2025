from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import requests
import llm as llm
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')

# --- Routes for Serving Frontend ---

@app.route('/')
def index():
    """Serves the main HTML page."""
    return render_template('index.html')

@app.route('/static/<path:path>')
def send_static(path):
    """Serves static files (CSS, JS)."""
    return send_from_directory('static', path)

# --- API Route for Document Analysis ---

@app.route('/analyze', methods=['POST'])
def analyze_document():
    """
    Receives document data from the frontend, calls the Gemini API,
    and returns the analysis.
    """
    # 1. Get data from the frontend request
    data = request.get_json()
    if not data or 'text' not in data or 'role' not in data:
        return jsonify({'error': 'Missing document text or role in request.'}), 400

    doc_text = data['text']
    role = data['role']
    
    try:
        # This function now returns a dictionary, not a string
        structured_result = llm.analyze_document(role, doc_text)
        
        # jsonify will correctly convert the dictionary to a JSON response
        return jsonify(structured_result)

    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini API: {e}")
        return jsonify({'error': 'Failed to communicate with the analysis service.'}), 502
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({'error': 'An internal server error occurred.'}), 500

if __name__ == '__main__':
    # Use debug=True for development, which enables auto-reloading
    app.run(debug=True, port=5000)
