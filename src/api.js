import moment from "moment";

const API_URL = "https://ymca.benoitzohar.com/.netlify/functions/";

async function doFetch(endpoint, data = {}) {
  try {
    const body = new URLSearchParams();
    body.set("token", localStorage.getItem("TOKEN"));
    Object.keys(data).forEach(key => {
      body.set(key, data[key]);
    });

    const params = {
      method: "POST",
      body
    };
    const response = await fetch(API_URL + endpoint, params);
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const fetchLogs = async function fetchLogs() {
  let { logs } = await doFetch("log-list");
  logs = logs || [];
  return logs.map(log => {
    const createdAt = moment(new Date(log.createdAt._seconds * 1000));
    return {
      ...log,
      createdAt: `${createdAt.fromNow()} (${createdAt.format(
        "dddd, MMMM Do, h:mm:ss a"
      )})`
    };
  });
};
