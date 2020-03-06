const querystring = require("querystring");

const { API_TOKEN } = process.env;

exports.checkAuthorization = function checkAuthorization(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Not Allowed" };
  }

  const { token } = querystring.parse(event.body);
  console.log("[BZ] API_TOKEN:", API_TOKEN);
  console.log("[BZ] token:", token);
  if (!token || token !== API_TOKEN) {
    return { statusCode: 403, body: "Not Allowed" };
  }

  return null;
};
