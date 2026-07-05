import { z } from 'zod';
import * as contractorService from '../services/contractorService.js';

const listQuerySchema = z.object({
  trade: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  q: z.string().min(1).optional(),
});

export async function list(req, res) {
  const filters = listQuerySchema.parse(req.query);
  const contractors = await contractorService.listContractors(filters);
  res.json({ contractors });
}
