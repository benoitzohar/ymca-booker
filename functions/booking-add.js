const querystring = require("querystring");

const { addBooking } = require("./src/firebase");
const { checkAuthorization, response } = require("./src/api");

exports.handler = async (event, context) => {
  const rejected = checkAuthorization(event);
  if (rejected) {
    return rejected;
  }

  const { user, day, time, court, repeat } = querystring.parse(event.body);

  if (!user || !day || !time || !court || !repeat) {
    return { statusCode: 405, body: "Missing params" };
  }

  try {
    await addBooking(user, day, time, court, repeat);
    return response({ status: "OK" });
  } catch (error) {
    return response(error.message, 500);
  }
};

// Allow to call `node booking-add.js` for debug purpose
if (process.env.NODE_ENV !== "PRODUCTION") {
  new Promise(async resolve => {
    console.log(
      await exports.handler({
        httpMethod: "POST",
        body: "token=test&verbose=true"
      })
    );
    resolve();
  });
}
