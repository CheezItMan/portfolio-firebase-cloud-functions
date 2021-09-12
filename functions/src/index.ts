import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';
admin.initializeApp();

type ConfigData = {
  SENDGRID_API_KEY: string,
  destination: string,
};

type EmailRequestBody = {
  name: string, 
  from: string, 
  subject: string,
  message: string,
}

export const addMessage = functions.https.onRequest(async (req, res) => {
  if (req.method == 'POST') {
    const {name, from, subject, message} = req.body as EmailRequestBody;
    console.log(req.body);    
      const snapshot = await admin.firestore().collection('config')
          .doc('APIs').get();
      if (snapshot.exists) {
        const configData = snapshot.data() as ConfigData;
        if ( name && from && subject && message) {
          admin.firestore().collection('mail').add({
            to: configData.destination,
            from: from,
            message: {
              subject: subject,
              html: message,
            },
          });

        const fullTextHTMLMessage = `<section>
          <h2>Portfolio Email from: ${from},</h2>
          <article>
            <h3>Subject:  ${subject}</h3>
            <br />
            ${message}
          </article>
        </section>
        `;

        const fullTextMessage = `
        From: ${from},
        Subject: ${subject}
        Message: ${message}
        `

        const msg = {
          to: configData.destination,
          from: configData.destination,
          subject,
          text: fullTextMessage,
          html: fullTextHTMLMessage,
        };
        try {
          sgMail.setApiKey(configData.SENDGRID_API_KEY);
          await sgMail.send(msg);
        } catch (error) {
          res.statusCode = 500;
          res.send({
            ok: false,
            message: 'Error Sending Email',
          });
          console.log('Error sending email');
          console.log(error);
          return;
        }
        res.statusCode = 201;
        res.send({
          'ok': true,
          'message': 'Email Sent!',
        });
        console.log('Email Sent Successfully');
      } else {
        res.statusCode = 500;
        res.send({
          ok: false,
          message: 'Cannot connect to get mail configuration data',
        });
        console.log('Cannot get email');
      }
    }
  }
});
