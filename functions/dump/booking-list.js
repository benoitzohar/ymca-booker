const querystring = require("querystring");

const { getBookings } = require("../src/firebase");
const { checkAuthorization } = require("../src/api");

exports.handler = async (event, context) => {
  const rejected = checkAuthorization(event);
  if (rejected) {
    return rejected;
  }

  try {
    const { status } = querystring.parse(event.body);
    const result = await getBookings(status || undefined);
    if (!result) {
      return { statusCode: 200, body: "{}" };
    }
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};
