import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import * as admin from 'firebase-admin';

admin.initializeApp();


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
