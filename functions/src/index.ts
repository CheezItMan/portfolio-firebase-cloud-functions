import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const addMessage = functions.https.onRequest(async (req, res) => {
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
      const apiData = await admin.firestore().collection('config')
          .doc('APIs').get();

      console.log('*****APIData*****');
      console.log(apiData);
      console.log('*****APIData*****');
    }
  }
});
