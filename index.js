// @ts-check

const express = require("express");
const path = require("path");
const moment = require("moment");

const { LogEntry, Slot, User } = require("./mongoose");

const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  Promise.all([
    LogEntry.find().sort({ createdAt: -1 }),
    Slot.find(),
    User.find()
  ])
    .then(([logsDB, slotsDB, users]) => {
      const logs = logsDB.map(log => {
        return {
          ...log.toObject(),
          date: moment
            .utc(log.createdAt)
            .local()
            .format("dddd Do MMMM HH:mm:ss")
        };
      });

      const slots = slotsDB.map(slot => {
        const m = moment().isoWeekday(slot.day);
        if (m < moment()) {
          m.add(1, "weeks");
        }

        let user = users.find(user => user.username === slot.user);

        return {
          day: m.format("dddd"),
          user: (user && user.name) || slot.user,
          court: slot.court,
          date: m.format("Do MMMM"),
          bookingDay: m.subtract(2, "days").format("dddd Do MMMM")
        };
      });

      res.render("index", { logs, slots });
    })
    .catch(() => {
      res.send("Sorry! Something went wrong.");
    });
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use("/", router);

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(
    `YMCA booker is running at: http://localhost:${server.address().port}`
  );
});
