const querystring = require("querystring");

const { addUser } = require("./src/firebase");
const { checkAuthorization, response } = require("./src/api");

exports.handler = async (event, context) => {
  const rejected = checkAuthorization(event);
  if (rejected) {
    return rejected;
  }

  const { username, name, barcode, pin } = querystring.parse(event.body);

  if (!username || !name || !barcode || !pin) {
    return { statusCode: 405, body: "Missing params" };
  }

  try {
    await addUser(username, name, barcode, pin);
    return response({ status: "OK" });
  } catch (error) {
    return response(error.message, 500);
  }
};

// Allow to call `node user-add.js` for debug purpose
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
