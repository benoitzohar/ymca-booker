var admin = require("firebase-admin");

var serviceAccount = require("./google-credentials.json");

let db;

function connect() {
  if (db && db.collection) {
    return db;
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ymca-booker.firebaseio.com"
  });

  db = admin.firestore();

  if (!db) {
    throw new Error("Could not connect to DB due to an unknown error");
  }
  if (!db.collection) {
    throw new Error("Could not access db.collection");
  }
  return db;
}

//
// Bookings
//

function Bookings() {
  const db = connect();
  return db.collection("bookings");
}

exports.getBookings = async function getBookings() {
  return Bookings()
    .get()
    .then(snapshot => {
      const bookings = [];
      snapshot.forEach(doc => {
        bookings.push({ id: doc.id, ...doc.data });
      });
      return { bookings };
    });
};

exports.addBooking = async function addBooking() {
  return Bookings()
    .code()
    .then(snapshot => {
      const bookings = [];
      snapshot.forEach(doc => {
        bookings.push({ id: doc.id, ...doc.data });
      });
      return { bookings };
    });
};

//
// Users
//

function Users() {
  const db = connect();
  return db.collection("users");
}

exports.getUsers = async function getUsers() {
  return Users()
    .get()
    .then(snapshot => {
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data });
      });
      return { users };
    });
};

exports.addUser = async function addUser(username, name, barcode, pin) {
  return Users()
    .code(username)
    .set({
      username,
      name,
      barcode,
      pin
    });
};
