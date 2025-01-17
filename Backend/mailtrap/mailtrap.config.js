import { MailtrapClient } from 'mailtrap';
import dotenv from 'dotenv';
dotenv.config();

// Mailtrap API token

const TOKEN = process.env.MAILTRAP_TOKEN;
const ENDPOINT = process.env.MAILTRAP_ENDPOINT;

// console.log(TOKEN, ENDPOINT);

export const mailtrapClient = new MailtrapClient({
  endpoint: ENDPOINT,
  token: TOKEN,
});

export const sender = {
  email: 'hello@demomailtrap.com',
  name: 'Gateway API',
};
