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
    console.log("response:", response);
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const fetchLogs = async function fetchLogs() {
  const { logs } = await doFetch("log-list");
  return logs || [];
};
