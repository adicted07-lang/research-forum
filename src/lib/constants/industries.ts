export const INDUSTRIES = [
  "Transport and Logistics",
  "Aerospace and Defence",
  "Packaging",
  "Automotive",
  "Agriculture",
  "Machinery and Equipment",
  "Energy and Power",
  "Consumer Goods",
  "Chemical and Material",
  "Healthcare",
  "Food and Beverages",
  "Semiconductor and Electronic",
  "ICT",
] as const;

export type Industry = (typeof INDUSTRIES)[number];
