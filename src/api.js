const API_URL = "https://ymca.benoitzohar.com/.netlify/functions/";

async function doFetch(endpoint, data = {}) {
  try {
    const params = {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify({ token: localStorage.getItem("TOKEN"), data })
    };
    const response = await fetch(API_URL + endpoint, params);
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
