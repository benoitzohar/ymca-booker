const { getLogs } = require("./src/firebase");
const { checkAuthorization, response } = require("./src/api");

exports.handler = async (event, context) => {
  const rejected = checkAuthorization(event);
  if (rejected) {
    return rejected;
  }

  try {
    const result = await getLogs();
    if (!result) {
      return response();
    }
    return response(result);
  } catch (error) {
    return response(error.message, 500);
  }
};
