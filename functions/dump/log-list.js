const { getLogs } = require("../src/firebase");
const { checkAuthorization } = require("../src/api");

exports.handler = async (event, context) => {
  const rejected = checkAuthorization(event);
  if (rejected) {
    return rejected;
  }

  try {
    const result = await getLogs();
    if (!result) {
      return { statusCode: 200, body: "{}" };
    }
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};
