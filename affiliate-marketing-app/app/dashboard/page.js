"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    // Fetch user's links
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    // Implement fetching links for the current user
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/links', {
        originalUrl: newUrl,
        userId: 1, // Replace with actual user ID
      });
      setLinks([...links, response.data]);
      setNewUrl('');
    } catch (error) {
      console.error('Error creating affiliate link:', error);
    }
  };

  return (
    <div>
      <h1>Affiliate Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Enter product URL"
          required
        />
        <button type="submit">Generate Affiliate Link</button>
      </form>
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            Original: {link.originalUrl}<br />
            Affiliate: {link.affiliateUrl}
          </li>
        ))}
      </ul>
    </div>
  );
}