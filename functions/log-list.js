const querystring = require("querystring");

const { getLogs } = require("./src/firebase");
const { checkAuthorization, response } = require("./src/api");

exports.handler = async (event, context) => {
  const rejected = checkAuthorization(event);
  if (rejected) {
    return rejected;
  }

  try {
    const { verbose } = querystring.parse(event.body);
    const result = await getLogs(!!verbose);
    if (!result) {
      return response();
    }
    return response(result);
  } catch (error) {
    return response(error.message, 500);
  }
};

// Allow to call `node log-list.js` for debug purpose
if (process.env.NODE_ENV !== "PRODUCTION") {
  new Promise(async resolve => {
    console.log(
      await exports.handler({
        httpMethod: "POST",
        body: "token=test&verbose=true"
      })
    );
    resolve();
  });
}
