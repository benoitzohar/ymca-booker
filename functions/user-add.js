const querystring = require("querystring");

const { addUser } = require("./src/firebase");
const { checkAuthorization } = require("./src/api");

exports.handler = async (event, context) => {
  const rejected = checkAuthorization(event);
  console.log("rejected", rejected);
  if (rejected) {
    console.log("HAS BEENrejected", rejected);
    return rejected;
  }
  console.log("[BZ] NO rejected");

  const { username, name, barcode, pin } = querystring.parse(event.body);

  console.log("[BZ] { username, name, barcode, pin }:", {
    username,
    name,
    barcode,
    pin
  });

  if (!username || !name || !barcode || !pin) {
    return { statusCode: 405, body: "Missing params" };
  }

  console.log("doing it");

  try {
    await addUser(username, name, barcode, pin);
    console.log("done it");
    return { statusCode: 200, body: "{status: 'OK'}" };
  } catch (error) {
    console.log("error", error);
    return { statusCode: 500, body: error.message };
  }
};
