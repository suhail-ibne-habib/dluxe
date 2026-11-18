import { strapi } from '@strapi/client';

const client = strapi({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://dluxe.eracodex.io/api',
  auth: process.env.STRAPI_SECRET_KEY ? { token: process.env.STRAPI_SECRET_KEY } : undefined,
});

export default client;