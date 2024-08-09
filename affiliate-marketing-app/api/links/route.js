"use server"
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { originalUrl, userId } = req.body;

    try {
      // Call Stackr API to generate affiliate link
      const stackrResponse = await axios.post('https://api.stackr.com/generate-affiliate-link', {
        originalUrl,
        // Add any necessary Stackr API authentication
      });

      const affiliateUrl = stackrResponse.data.affiliateUrl;

      // Save the link to the database
      const link = await prisma.link.create({
        data: {
          originalUrl,
          affiliateUrl,
          userId,
        },
      });

      res.status(200).json(link);
    } catch (error) {
      res.status(500).json({ error: 'Error generating affiliate link' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}