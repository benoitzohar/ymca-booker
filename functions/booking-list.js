const querystring = require("querystring");

const { getBookings } = require("./src/firebase");
const { checkAuthorization } = require("./src/api");

exports.handler = async (event, context) => {
  const rejected = checkAuthorization(event);
  if (rejected) {
    return rejected;
  }

  try {
    const { status, verbose } = querystring.parse(event.body);
    const result = await getBookings(status || undefined, verbose);
    if (!result) {
      return { statusCode: 200, body: "{}" };
    }
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};

// Allow to call `node log-list.js` for debug purpose
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
