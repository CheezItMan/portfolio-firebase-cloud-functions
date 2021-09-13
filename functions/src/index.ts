import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as corsModule from 'cors';

const cors = corsModule({
  origin: true,
});
admin.initializeApp();
// const db = admin.firestore();

// Sendgrid config
import * as sgMail from '@sendgrid/mail';
const API_KEY = functions.config().sendgrid.key;
// const TEMPLATE_ID = functions.config().sendgrid.template;
sgMail.setApiKey(API_KEY);
const EMAIL_RECIPIENT = functions.config().send.recipient;
const FROM_EMAIL = functions.config().send.from;


type EmailRequestBody = {
  name: string,
  from: string,
  subject: string,
  message: string,
}

export const addMessage = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    const {name, subject, message} = req.body as EmailRequestBody;
    console.log('Sending Email');
    console.log(`API_KEY = ${API_KEY}`);
    console.log(`EMAIL_RECIPIENT = ${EMAIL_RECIPIENT}`);

    const text = `<div>
      <h2>Email from Portfolio</h2>
      <h3>FROM:  ${name}</h3>
      <h3>Subject: ${subject}</h3>
      <p>${message}</p>
    `;

    const msg = {
      to: EMAIL_RECIPIENT,
      from: FROM_EMAIL,
      subject: `${name} sent a message`,
      text: text,
      html: text,
    };
    try {
      await sgMail.send(msg);
      res.status(201).send({
        ok: true,
        message: 'Email Sent!',
      });
    } catch (error) {
      console.log(`sgmail error = ${error}`);
      res.status(500).send({
        ok: false,
        message: 'Email sending error',
      });
      return;
    }
  });
});
