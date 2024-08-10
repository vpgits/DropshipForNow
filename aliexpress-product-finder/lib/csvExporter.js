import { Parser } from 'json2csv';

export function exportToCsv(products) {
  const fields = ['name', 'price', 'aiScore', 'url'];
  const opts = { fields };
  const parser = new Parser(opts);
  return parser.parse(products);
}