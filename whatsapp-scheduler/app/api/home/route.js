"use server";
import { parse } from 'csv-parse/sync';
import formidable from 'formidable';
import fs from 'fs/promises';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

// You would get these from your WhatsApp Business API setup
const WHATSAPP_API_URL = 'https://your-whatsapp-api-endpoint.com';
const WHATSAPP_API_TOKEN = 'your-whatsapp-api-token';

async function sendWhatsAppMessage(phoneNumber, message, mediaUrl = null) {
  const data = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "text",
    text: { body: message }
  };

  if (mediaUrl) {
    data.type = "image";  // or "audio", "document", "video" as appropriate
    data.image = { link: mediaUrl };
  }

  try {
    const response = await axios.post(`${WHATSAPP_API_URL}/messages`, data, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const csvFile = files.file;
    const message = fields.message;
    const mediaFile = files.media;

    if (!csvFile) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    }

    if (!csvFile.originalFilename.endsWith('.csv')) {
      return res.status(400).json({ error: 'Invalid file format. Please upload a CSV file.' });
    }

    try {
      const fileContent = await fs.readFile(csvFile.filepath, 'utf8');
      const records = parse(fileContent, { columns: true, skip_empty_lines: true });

      let mediaUrl = null;
      if (mediaFile) {
        // In a real application, you'd upload the media file to a storage service
        // and get a public URL to use with the WhatsApp API
        mediaUrl = 'https://example.com/path/to/uploaded/media.jpg';
      }

      const scheduled = [];

      for (const record of records) {
        const { phone_number, time } = record;
        try {
          await sendWhatsAppMessage(phone_number, message, mediaUrl);
          scheduled.push(`Message scheduled for ${phone_number} at ${time}`);
        } catch (error) {
          scheduled.push(`Error scheduling message for ${phone_number}: ${error.message}`);
        }
      }

      res.status(200).json({ scheduled });
    } catch (error) {
      res.status(500).json({ error: 'Error processing files or sending messages' });
    }
  });
}