"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Stats() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Implement fetching sales statistics
  };

  return (
    <div>
      <h1>Sales Statistics</h1>
      <ul>
        {stats.map((stat) => (
          <li key={stat.linkId}>
            Link ID: {stat.linkId}<br />
            Total Sales: ${stat.totalAmount}
          </li>
        ))}
      </ul>
    </div>
  );
}