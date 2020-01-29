// @ts-check

const puppeteer = require("puppeteer");
const DB = require("./mongoose");
const moment = require("moment");

const puppeteerOpts = process.env.DEBUG
  ? {
      headless: false,
      devtools: true
    }
  : {
      args: ["--no-sandbox"]
    };

const WAIT_TIME = 500;

const SQUASH_COURT_REFERENCES = {
  "2": "43",
  "3": "44",
  "4": "45",
  "5": "46"
};

console.log("Starting puppeteer.launch() from book.js...");

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

async function book(p, targetDate, user, time, court) {
  const targetDay = targetDate.get("date");
  const targetMonth = targetDate.get("month") + 1;

  await p.goto("https://inscription.ymcaquebec.org");

  await logout(p);

  //
  // LOGIN
  //

  await p.click("#toolbar-login > .focus-parent");
  await p.waitFor(WAIT_TIME);
  await p.click("#ClientBarcode");
  await p.keyboard.type(user.barcode);
  await p.click("#AccountPIN");
  await p.keyboard.type(user.pin);
  await p.click("#Enter");
  await p.waitFor(WAIT_TIME);

  const ignorePreviousTransactionsSelectore =
    "a[title='Click to ignore previous incomplete transactions']";

  if ((await p.$(ignorePreviousTransactionsSelectore)) !== null) {
    p.click(ignorePreviousTransactionsSelectore);
    await p.waitFor(WAIT_TIME);
  }

  //
  // BOOKING
  //

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
    throw new Error(
      `Could not book for ${
        user.name
      } for court #${court} at ${time}pm on ${targetDate.format(
        "dddd, MMMM Do YYYY"
      )} because the search returned ${rows.length} results.`
    );
  }

  await p.click("#chkBook1");
  await p.click("#AddBookBottom");
  await p.waitFor(WAIT_TIME);
  await p.click("input[title='Click to Checkout']");

  await p.waitFor(WAIT_TIME);

  await p.click("#completeTransactionButton");

  await p.waitFor(WAIT_TIME);
  await logout(p);
}

async function logout(p) {
  const logoutSelector = "#toolbar-logout > .custombtn";
  if ((await p.$$(logoutSelector)).length) {
    await p.click(logoutSelector);
  }
  await p.waitFor(WAIT_TIME);
}

(async () => {
  try {
    const users = await DB.User.find({});
    const slots = await DB.Slot.find({});
    const browser = await puppeteer.launch(puppeteerOpts);
    let noBookingToday = true;
    const targetDate = moment.utc().add(2, "days");
    const targetDayNumber = targetDate.weekday();

    for (const slot of slots) {
      if (slot.day === targetDayNumber) {
        noBookingToday = false;
        const user = users.find(user => user.username === slot.user);
        if (!user) {
          throw new Error(`Could not find user ${user}`);
        }

        try {
          const page = await browser.newPage();
          await book(page, targetDate, user.toObject(), slot.time, slot.court);
          DB.log(
            `Booking with ${user.name} for court #${slot.court} at ${
              slot.time
            }pm on ${targetDate.format("dddd, MMMM Do YYYY")}`,
            true,
            true
          );
        } catch (err) {
          DB.log(err.message, false, false);
        }
      }
    }

    if (noBookingToday) {
      DB.log(
        `No booking planned for ${targetDate.format("dddd, MMMM Do YYYY")}`,
        true,
        false
      );
    }

    await browser.close();
  } catch (err) {
    DB.log(err.message, false, false);
  }

  DB.disconnect();
})();
