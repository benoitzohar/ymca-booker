const querystring = require("querystring");

const { addBooking } = require("./src/firebase");
const { checkAuthorization } = require("./src/api");

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
    return { statusCode: 200, body: "{status: 'OK'}" };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};
