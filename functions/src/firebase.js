var admin = require("firebase-admin");
const uuid = require("uuid");

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

exports.getBookings = async function getBookings(status) {
  const query = status ? Bookings().where("status", "==", status) : Bookings();

  return query.get().then(snapshot => {
    const bookings = [];
    snapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    return { bookings };
  });
};

exports.addBooking = async function addBooking(user, day, time, court, repeat) {
  return Bookings()
    .doc(uuid.v4())
    .set({
      user,
      day,
      time,
      court,
      repeat,
      status: "PENDING"
    });
};

exports.updateBookingStatus = async function updateBookingStatus(id, status) {
  return Bookings()
    .doc(id)
    .update({
      status
    });
};

exports.addLogToBooking = async function addLogToBooking(bookingId, message) {
  return Bookings()
    .doc(bookingId)
    .get()
    .then(doc => {
      const data = doc.data();
      const logs = (data && data.logs) || [];
      logs.push({ message, createdAt: new Date() });
      return Bookings()
        .doc(bookingId)
        .update({ logs });
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
        users.push({ id: doc.id, ...doc.data() });
      });
      return { users };
    });
};

exports.addUser = async function addUser(username, name, barcode, pin) {
  return Users()
    .doc(username)
    .set({
      username,
      name,
      barcode,
      pin
    });
};

//
// Logs
//

function Logs() {
  const db = connect();
  return db.collection("logs");
}

exports.getLogs = async function getLogs() {
  return Logs()
    .get()
    .then(snapshot => {
      const logs = [];
      snapshot.forEach(doc => {
        logs.push(doc.data());
      });
      return { logs };
    });
};

exports.addLog = async function addLog(message) {
  return Logs()
    .doc(uuid.v4())
    .set({
      createdAt: new Date(),
      message
    });
};

//
// Settings
//

function Settings() {
  const db = connect();
  return db.collection("settings");
}

exports.setLastRun = async function setLastRun() {
  return Settings()
    .doc("settings")
    .set({
      lastRun: new Date()
    });
};
