import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [media, setMedia] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleMediaChange = (e) => {
    setMedia(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', message);
    if (media) {
      formData.append('media', media);
    }

    try {
      const response = await axios.post('/api/schedule', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(response.data.scheduled);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WhatsApp Message Scheduler</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label className="block mb-2">CSV File (contacts and schedule):</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".csv"
            className="mb-2"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded"
            rows="4"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Media (optional):</label>
          <input
            type="file"
            onChange={handleMediaChange}
            accept="image/*,video/*,audio/*"
            className="mb-2"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Schedule Messages
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Scheduled Messages:</h2>
          <ul className="list-disc pl-5">
            {results.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}