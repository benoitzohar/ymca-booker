// @ts-check

const puppeteer = require("puppeteer-core");
const chromium = require("chrome-aws-lambda");
const moment = require("moment-timezone");

const {
  getBookings,
  addBooking,
  updateBookingStatus,
  addLogToBooking,
  addLog,
  getUsers,
  setLastRun
} = require("./firebase");

const WAIT_TIME = 500;
const MAX_ATTEMPTS = 6;

const SQUASH_COURT_REFERENCES = {
  "2": "43",
  "3": "44",
  "4": "45",
  "5": "46"
};

const escapeXpathString = str => {
  const splitedQuotes = str.replace(/'/g, `', "'", '`);
  return `concat('${splitedQuotes}', '')`;
};

const clickByText = async (page, text) => {
  const escapedText = escapeXpathString(text);
  const linkHandlers = await page.$x(`//a[contains(text(), ${escapedText})]`);

  if (linkHandlers.length > 0) {
    await linkHandlers[0].click();
  } else {
    throw new Error(`Link not found: ${text}`);
  }
};

async function proceedForBooking(
  browser,
  booking,
  users,
  targetDate,
  targetDayNumber,
  targetMonthNumber,
  verbose
) {
  const bookingDate = moment.tz(booking.date, "America/Toronto");
  if (
    bookingDate.date() === targetDayNumber &&
    bookingDate.month() === targetMonthNumber
  ) {
    verboseLog(verbose, { log: "Ready to book this booking", booking });
    const user = users.find(user => user.username === booking.user);
    if (!user) {
      throw new Error(`Could not find user ${user}`);
    }

    verboseLog(verbose, "Update booking status to RUNNING");
    updateBookingStatus(booking.id, "RUNNING", (booking.attempts || 0) + 1);

    try {
      verboseLog(verbose, "Create new incognito context");
      const context = await browser.createIncognitoBrowserContext();
      verboseLog(verbose, "Create new page");
      const page = await context.newPage();
      verboseLog(verbose, "Attempt booking...");
      await attemptBooking(
        page,
        targetDate,
        user,
        booking.time,
        booking.court,
        verbose
      );
      verboseLog(verbose, "Close context");
      await context.close();
      verboseLog(verbose, "Add log to booking");
      await addLogToBooking(
        booking.id,
        `Booked with ${user.name} for court #${booking.court} at ${
          booking.time
        }pm on ${targetDate.format("dddd, MMMM Do YYYY")}`
      );
      verboseLog(verbose, "Update booking status to SUCCESS");
      await updateBookingStatus(booking.id, "SUCCESS");

      if (booking.repeat) {
        verboseLog(verbose, {
          log: "Create new reccurring booking for",
          booking
        });
        await addBooking(
          user.id,
          booking.day,
          booking.time,
          booking.court,
          true
        );
      }
    } catch (err) {
      verboseLog(verbose, { error2: err.message });
      if (booking.attempts >= MAX_ATTEMPTS) {
        verboseLog(verbose, "Update booking status to FAILURE in error");
        await updateBookingStatus(booking.id, "FAILURE");
        verboseLog(verbose, {
          log: "Create new reccurring booking for",
          booking
        });
        if (booking.repeat) {
          await addBooking(
            user.id,
            booking.day,
            booking.time,
            booking.court,
            true
          );
        }
      } else {
        verboseLog(verbose, "Update booking status to PENDING in error");
        await updateBookingStatus(booking.id, "PENDING");
      }

      verboseLog(verbose, "Add log to booking in error");
      await addLogToBooking(booking.id, err.message);
    }
    return true;
  }
  return false;
}

async function attemptBooking(p, targetDate, user, time, court, verbose) {
  const targetDay = targetDate.get("date");
  const targetMonth = targetDate.get("month") + 1;

  verboseLog(verbose, { browser: "Go to" });
  await p.goto("https://inscription.ymcaquebec.org");

  await logout(p, verbose);

  //
  // LOGIN
  //

  verboseLog(verbose, { browser: "Login" });
  await p.click("#toolbar-login > .focus-parent");
  await p.waitFor(WAIT_TIME);
  await p.click("#ClientBarcode");
  await p.keyboard.type(user.barcode);
  await p.click("#AccountPIN");
  await p.keyboard.type(user.pin);
  await p.click("#Enter");
  await p.waitFor(WAIT_TIME);

  const ignorePreviousTransactionsSelector =
    "a[title='Click to ignore previous incomplete transactions']";

  if ((await p.$(ignorePreviousTransactionsSelector)) !== null) {
    verboseLog(verbose, { browser: "ignorePreviousTransactions" });
    p.click(ignorePreviousTransactionsSelector);
    await p.waitFor(WAIT_TIME);
  }

  //
  // BOOKING
  //

  verboseLog(verbose, { browser: "Start booking" });
  await clickByText(p, "Court Reservations");
  await p.waitForNavigation();
  await p.click("#search-facbook-radio");
  await p.waitFor(WAIT_TIME);

  await p.select("#DayFrom", String(targetDay));
  await p.select("#MonthFrom", String(targetMonth));
  await p.select("#DayTo", String(targetDay));
  await p.select("#MonthTo", String(targetMonth));

  const hours_from = parseInt(time.split(":")[0], 10);
  const hours_to = hours_from + 1;

  await p.select('[name="TimeFrom"]', String(hours_from));
  await p.select('[name="AMPMFrom"]', "1"); // PM
  await p.select('[name="TimeTo"]', String(hours_to));
  await p.select('[name="AMPMTo"]', "1"); // PM
  await p.select("#FacilityFunctions", "3");
  await p.click("ul > :nth-child(2) > input");
  await p.select("#FacilityTypes", SQUASH_COURT_REFERENCES[court]);
  await p.click(
    '[style="clear:left;"] > [style=" float:right;"] > .ui-state-default'
  );

  await p.waitFor(WAIT_TIME);

  const rows = await p.$$(".search-result-row");
  if (rows.length !== 1) {
    verboseLog(verbose, "No rows available");
    throw new Error(
      `Could not book for ${
        user.name
      } for court #${court} at ${time}pm on ${targetDate.format(
        "dddd, MMMM Do YYYY"
      )} because the search returned ${rows.length} results.`
    );
  }

  verboseLog(verbose, { browser: "Found row, process to checkout" });
  await p.click("#chkBook1");
  await p.click("#AddBookBottom");
  await p.waitFor(WAIT_TIME);
  await p.click("input[title='Click to Checkout']");

  await p.waitFor(WAIT_TIME);

  await p.click("#completeTransactionButton");

  await p.waitFor(WAIT_TIME);
  await logout(p, verbose);
}

async function logout(p, verbose) {
  verboseLog(verbose, { browser: "Logout" });
  const logoutSelector = "#toolbar-logout > .custombtn";
  if ((await p.$$(logoutSelector)).length) {
    await p.click(logoutSelector);
  }
  await p.waitFor(WAIT_TIME);
}

function verboseLog(verbose, data) {
  if (verbose) {
    if (typeof data === "string") {
      console.log(data);
    } else {
      Object.keys(data).forEach(key =>
        console.log(`${key}:`, JSON.stringify(data[key], null, 2))
      );
    }
  }
}

//
// AWS lambdas time out after 10s.
// Doing as many things asynchroneous as possible
// to avoid getting cut off.
//
exports.book = async function book(verbose = false) {
  const runningBookings = await getBookings("RUNNING");
  const { bookings } = await getBookings("PENDING");

  // add the previously RUNNING bookings to avoid waiting for the
  // database request
  if (
    runningBookings &&
    runningBookings.bookings &&
    runningBookings.bookings.length
  ) {
    verboseLog(
      verbose,
      runningBookings.bookings.length +
        " booking(s) were still RUNNING. Resetting them..."
    );
    runningBookings.bookings.forEach(booking => {
      bookings.push(booking);
      updateBookingStatus(booking.id, "PENDING");
    });
  }

  verboseLog(verbose, { bookings });
  const { users } = await getUsers();
  verboseLog(verbose, { users });

  verboseLog(verbose, "setLastRun()");
  await setLastRun();
  let browser;
  try {
    verboseLog(verbose, "Starting puppeteer.launch() from book.js...");
    browser = await chromium.puppeteer.launch({
      executablePath: await chromium.executablePath,
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      headless: chromium.headless
    });

    const targetDate = moment()
      .tz("America/Toronto")
      .add(2, "days");
    const targetDayNumber = targetDate.date();
    const targetMonthNumber = targetDate.month();

    verboseLog(verbose, {
      targetDate: targetDate.format(),
      targetDayNumber,
      targetMonthNumber
    });

    const proceeds = [];

    for (const booking of bookings) {
      proceeds.push(
        proceedForBooking(
          browser,
          booking,
          users,
          targetDate,
          targetDayNumber,
          targetMonthNumber,
          verbose
        )
      );
    }

    let noBookingToday = true;
    await Promise.all(proceeds).then(haveBooking => {
      noBookingToday = !haveBooking.find(hasBooking => !!hasBooking);
    });

    if (noBookingToday) {
      const noBookingMessage = `No booking planned for ${targetDate.format(
        "dddd, MMMM Do YYYY"
      )}`;
      verboseLog(verbose, noBookingMessage);
      await addLog(noBookingMessage);
    }

    verboseLog(verbose, "browser.close()");
    await browser.close();
  } catch (err) {
    verboseLog(verbose, { error1: err.message });
    await addLog(err.message);
    browser && (await browser.close());
    throw err;
  }
};
