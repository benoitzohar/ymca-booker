const querystring = require("querystring");

const { addUser } = require("../src/firebase");
const { checkAuthorization } = require("../src/api");

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
    return { statusCode: 200, body: "{status: 'OK'}" };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};
