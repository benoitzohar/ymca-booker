const querystring = require("querystring");

const { API_TOKEN } = process.env;

exports.checkAuthorization = function checkAuthorization(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept"
      },
      body: JSON.stringify({ message: "You can use CORS" })
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Not Allowed" };
  }

  const { token } = querystring.parse(event.body);
  if (!token || token !== API_TOKEN) {
    return { statusCode: 403, body: "Not Allowed" };
  }

  return null;
};

exports.response = function response(data = {}, statusCode = 200) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept"
  };
  return { headers, statusCode, body: JSON.stringify(data) };
};
