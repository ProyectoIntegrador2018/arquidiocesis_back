/**
 * Module for managing web push notification subscriptions
 */

const WebPushNotifications = require('../WebPushNotifications');

const subscribe = async (_, req, res) => {
  const { userID, subscription } = req.body;
  await WebPushNotifications.saveSubscriptionForUserByID(userID, subscription);
  return res.status(200).json({ error: false });
};

module.exports = {
  subscribe,
};
