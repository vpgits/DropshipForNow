"use server";
import { parse } from 'csv-parse/sync';
import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

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

      let mediaInfo = null;
      if (mediaFile) {
        // In a real application, you'd process and store the media file here
        mediaInfo = {
          filename: mediaFile.originalFilename,
          type: mediaFile.mimetype,
          size: mediaFile.size,
        };
      }

      const scheduled = records.map(record => {
        const { phone_number, time } = record;
        // Here you would integrate with a WhatsApp API to actually schedule the message
        // For now, we'll just return a mock scheduling confirmation
        let scheduledMessage = `Message scheduled for ${phone_number} at ${time}`;
        if (mediaInfo) {
          scheduledMessage += ` with media: ${mediaInfo.filename}`;
        }
        return scheduledMessage;
      });

      res.status(200).json({ scheduled });
    } catch (error) {
      res.status(500).json({ error: 'Error processing files' });
    }
  });
}