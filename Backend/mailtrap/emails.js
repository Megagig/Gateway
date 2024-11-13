import { mailtrapClient, sender } from './mailtrap.config.js';
import { VERIFICATION_EMAIL_TEMPLATE } from './emailTemplates.js';

// Function to send verification email

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient, // Email address of the recipient
      Subject: 'Verify your email',
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        '{verificationCode}',
        verificationToken
      ),
      category: 'email verification', // For tracking in Mailtrap’s analytics
    });
    console.log('Email sent successfully', response);
  } catch (error) {
    console.error('Error sending email verification', error);
    throw new Error(`Error sending email verification: ${error.message}`);
  }
};

// Function to send a welcome email

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: '960761a5-6d93-42c0-a980-16eb2c1bd68e',
      template_variables: {
        company_info_name: 'Gateway Inc.',
        name: 'name',
      },
    });
    console.log('Welcome Email sent successfully', response);
  } catch (error) {
    console.error('Error sending welcome email', error);
    throw new Error(`Error sending welcome email: ${error.message}`);
  }
};
