const book = require("./src/book");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const result = await book();
    return { statusCode: 200, body: result || "OK" };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};