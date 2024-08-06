from flask import Flask, render_template, request, jsonify
import pywhatkit
import datetime
import csv
import io
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/schedule', methods=['POST'])
def schedule_messages():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and file.filename.endswith('.csv'):
        try:
            csv_file = io.TextIOWrapper(file.stream, encoding='utf-8-sig')
            reader = csv.DictReader(csv_file)
            scheduled = []

            for row in reader:
                phone_number = row['phone_number']
                text = row['message']
                send_time = datetime.datetime.strptime(row['time'], '%Y-%m-%d %H:%M')

                # Instead of actually scheduling, we'll just log the attempt
                logging.info(f"Would schedule message to {phone_number} at {send_time}: {text}")
                scheduled.append(f"Message would be scheduled for {phone_number} at {send_time}")

            return jsonify({'scheduled': scheduled})
        except Exception as e:
            logging.error(f"Error processing CSV: {str(e)}")
            return jsonify({'error': 'Error processing CSV file'}), 500
    else:
        return jsonify({'error': 'Invalid file format. Please upload a CSV file.'}), 400

if __name__ == '__main__':
    app.run(debug=True)