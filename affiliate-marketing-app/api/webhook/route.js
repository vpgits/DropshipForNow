"use server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { linkId, amount } = req.body;

    try {
      const sale = await prisma.sale.create({
        data: {
          amount,
          linkId,
        },
      });

      res.status(200).json(sale);
    } catch (error) {
      res.status(500).json({ error: 'Error recording sale' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}