// @ts-check

const mongoose = require("mongoose");

console.log("Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err =>
    console.log("An error occured while connecting to MongoDB:", err)
  );

function log(message, success, booked) {
  console.log("message:", message, " success:", success, "booked:", booked);

  const log = new LogEntry({
    message,
    success,
    booked
  });
  log.save();
}

function disconnect() {
  setTimeout(() => {
    mongoose.connection.close();
  }, 4000);
}

const LogEntry = mongoose.model(
  "Log",
  new mongoose.Schema(
    {
      message: String,
      success: Boolean,
      booked: Boolean
    },
    {
      timestamps: true
    }
  )
);
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    name: String,
    barcode: String,
    pin: String
  })
);
const Slot = mongoose.model(
  "Slot",
  new mongoose.Schema({
    day: Number,
    time: String,
    user: String,
    court: String
  })
);

module.exports = {
  LogEntry,
  User,
  Slot,
  log,
  disconnect
};
