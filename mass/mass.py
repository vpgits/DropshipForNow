from flask import Flask, render_template, request, jsonify
import pywhatkit
import datetime
import csv
import io

app = Flask(__name__)

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
        csv_file = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        reader = csv.DictReader(csv_file)
        scheduled = []

        for row in reader:
            phone_number = row['phone_number']
            text = row['message']
            send_time = datetime.datetime.strptime(row['time'], '%Y-%m-%d %H:%M')

            try:
                pywhatkit.sendwhatmsg(
                    phone_no=phone_number,
                    message=text,
                    time_hour=send_time.hour,
                    time_min=send_time.minute
                )
                scheduled.append(f"Message scheduled for {phone_number} at {send_time}")
            except Exception as e:
                scheduled.append(f"Error scheduling message for {phone_number}: {str(e)}")

        return jsonify({'scheduled': scheduled})
    else:
        return jsonify({'error': 'Invalid file format. Please upload a CSV file.'}), 400

if __name__ == '__main__':
    app.run(debug=True)