var admin = require("firebase-admin");

var serviceAccount = require("./google-credentials.json");

export default async function book() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ymca-booker.firebaseio.com"
  });

  return "Book OK.";
}
