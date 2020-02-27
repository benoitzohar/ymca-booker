var admin = require("firebase-admin");

var serviceAccount = require("./google-credentials.json");

exports.book = async function book() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ymca-booker.firebaseio.com"
  });

  const db = admin.firestore();

  let docRef = db.collection("users").doc("alovelace");

  docRef.set({
    first: "Ada",
    last: "Lovelace",
    born: 1815
  });

  return "Book OK.";
};
