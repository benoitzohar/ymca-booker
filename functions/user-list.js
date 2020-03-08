const { getUsers } = require("./src/firebase");
const { checkAuthorization, response } = require("./src/api");

exports.handler = async (event, context) => {
  const rejected = checkAuthorization(event);
  if (rejected) {
    return rejected;
  }

  try {
    const result = await getUsers();
    if (!result) {
      return response();
    }
    return response(result);
  } catch (error) {
    return response(error.message, 500);
  }
};

// Allow to call `node user-list.js` for debug purpose
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
