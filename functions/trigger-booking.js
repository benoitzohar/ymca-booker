//const { book } = require("./src/book");
const { checkAuthorization } = require("./src/api");

exports.handler = async (event, context) => {
  const rejected = checkAuthorization(event);
  if (rejected) {
    return rejected;
  }
  try {
    //await book();
    return { statusCode: 200, body: "OK" };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};
