var admin = require("firebase-admin");

var serviceAccount = require("./google-credentials.json");

exports.book = async function book() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ymca-booker.firebaseio.com"
  });

  await timeout(20);

  return "Book OK.";
};

async function timeout(x) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve();
    }, x * 1000);
  });
}
