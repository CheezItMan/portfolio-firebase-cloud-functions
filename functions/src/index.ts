import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const addMessage = functions.https.onRequest(async (req, res) => {
  console.log('testing');
});
