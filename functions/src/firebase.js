var admin = require("firebase-admin");
const uuid = require("uuid");
const moment = require("moment-timezone");

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

exports.getBookings = async function getBookings(status, verbose) {
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
  let nextRunDate = moment()
    .tz("America/Toronto")
    .add(1, "weeks")
    .add(2, "days")
    .weekday(day);
  const date = nextRunDate.format("YYYY-MM-DD");

  return Bookings()
    .doc(uuid.v4())
    .set({
      user,
      day,
      date,
      time,
      court,
      repeat,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date()
    });
};

exports.updateBookingStatus = async function updateBookingStatus(
  id,
  status,
  attempts = 0
) {
  return Bookings()
    .doc(id)
    .update({
      status,
      ...(attempts ? { attempts } : {}),
      updatedAt: new Date()
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

exports.getLogs = async function getLogs(verbose) {
  return Logs()
    .orderBy("createdAt", "desc")
    .limit(50)
    .get()
    .then(snapshot => {
      const logs = [];
      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
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
