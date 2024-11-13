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
// const recipients = [
//   {
//     email: 'megagigsoftwaresolutions@gmail.com',
//   },
// ];

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: 'You are awesome!',
//     text: 'Congrats for sending test email with Mailtrap!',
//     html: '<h1>Congrats for sending test email with Mailtrap!</h1>',
//     category: 'Integration Test',
//   })
//   .then(console.log, console.error);
