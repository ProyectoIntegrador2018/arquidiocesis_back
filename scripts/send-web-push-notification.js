require('dotenv').config();

const admin = require('firebase-admin');
const WebPushNotifications = require('../WebPushNotifications');

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceJson = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT,
    'base64'
  ).toString();
  try {
    const serviceAccount = JSON.parse(serviceJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.error(e);
  }
} else {
  const serviceAccount = require('../ServiceAccountKey');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function main() {
  if (process.argv.length < 3) {
    console.log('Missing parameter: user ID');
    return;
  }

  const id = process.argv[2];
  WebPushNotifications.init(
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  try {
    await WebPushNotifications.sendToUserByID(id, {
      title: 'Test Notification',
      body: 'Test notification sent from Arquidiocesis backend script.',
    });
  } catch (e) {
    console.error(e);
  }
}

main();
