const webpush = require('web-push');
const { firestore } = require('firebase-admin');

/**
 * @returns {void}
 */
function init(publicKey, privateKey) {
  webpush.setVapidDetails(
    'mailto:arquidiocesis.itesm.mty@gmail.com',
    publicKey ?? process.env.VAPID_PUBLIC_KEY,
    privateKey ?? process.env.VAPID_PRIVATE_KEY
  );
}

/**
 *
 * @param {string} id
 * @param {{endpoint: string, expirationTime: number, keys: {auth: string, p256dh: string}}} subscription
 * @returns {Promise<void>}
 */
async function saveSubscriptionForUserByID(id, subscription) {
  await firestore()
    .collection('users')
    .doc(id)
    .update({
      web_push_notifications_info: firestore.FieldValue.arrayUnion(
        subscription
      ),
    });
}

/**
 * @param {string} id
 * @param {{title: string, body: string, data: Object}} payload
 * @returns {Promise<void>}
 */
async function sendToUserByID(id, payload) {
  const user = await firestore().collection('users').doc(id).get();

  if (!user.exists) {
    throw new Error(
      `Attempted to send notification to non-existent user with ID: ${id}`
    );
  }

  const { web_push_notifications_info } = user.data();
  if (web_push_notifications_info != null) {
    await Promise.all(
      web_push_notifications_info.map((subscription) =>
        webpush.sendNotification(subscription, JSON.stringify(payload))
      )
    );
  } else {
    throw new Error(
      `Attempted to send notification to unsubscribed user with ID: ${id}`
    );
  }
}

module.exports = {
  init,
  saveSubscriptionForUserByID,
  sendToUserByID,
};
