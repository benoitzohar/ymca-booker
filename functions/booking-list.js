const { getBookings } = require("./src/firebase");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Not Allowed" };
  }

  try {
    const result = await getBookings();
    if (!result) {
      return { statusCode: 200, body: "{}" };
    }
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};
