const querystring = require("querystring");

const { book } = require("./src/book");
const { checkAuthorization, response } = require("./src/api");

exports.handler = async (event, context) => {
  const rejected = checkAuthorization(event);
  if (rejected) {
    return rejected;
  }
  try {
    const { verbose } = querystring.parse(event.body);
    await book(!!verbose);
    return response({ status: "OK" });
  } catch (error) {
    return response(error.message, 500);
  }
};

// Allow to call `node trigger-booking.js` for debug purpose
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
