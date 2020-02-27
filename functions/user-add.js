const querystring = require("querystring");

const { addUser } = require("./src/firebase");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Not Allowed" };
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
