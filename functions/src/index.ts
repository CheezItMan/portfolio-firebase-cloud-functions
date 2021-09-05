import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';

dotenv.config();
admin.initializeApp();

const { SENDER_EMAIL, SENDER_PASSWORD } = process.env;

export const addMessage = functions.https.onRequest(async (req, res) => {
// Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin.firestore().collection('messages')
      .add({original: original});
    // Send back a message that we've successfully written the message
  res.json({result: `Message with ID: ${writeResult.id} added.`});
});

// Listens for new messages added to /messages/:documentId/original
//    and creates an
// uppercase version of the message to /messages/:documentId/uppercase
export const makeUppercase = functions.firestore
    .document('/messages/{documentId}')
    .onCreate((snapshot, context) => {
      const original = snapshot.data().original;

      functions.logger.log('Uppercasing', context.params.documentId, original);

      const uppercase = original.toUpperCase();

      return snapshot.ref.set({uppercase}, {merge: true});
    });


export const sendEmail = functions.https.onRequest( (req, res) => {
  if (req.method == 'POST') {
    console.log('Got a post request!');
    console.log(req.body);

    const {name, from, subject, message} = req.body;
    console.log(req.body);

    if ( name && from && subject && message) {
      admin.firestore().collection('mail').add({
        to: 'mcanallyc@gmail.com',
        from: from,
        message: {
          subject: subject,
          html: message,
        },
      });

      const authData = nodemailer.createTransport({
        host: 'stmp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: SENDER_EMAIL,
          pass: SENDER_PASSWORD,
        },
      });

      authData.sendMail({
        from,
        to: 'mcanallyc@gmail.com',
        subject,
        text: message,
        html: message,
      }).then(() => console.log('success sending email'))
          .catch((error: any) => {
            console.log(`Error sending email ${error.message}`);
          });

      res.status(201).json({
        message: `Email sent from ${from}`,
      });
    } else {
      res.status(400).json({
        message: 'Request must include name, email, subject and message fields',
      });
    }
  } else {
    res.status(404).json({
      message: 'Request must be a POST request.',
    });
  }
});
