import { message } from "antd";

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
    message.error(error.message);
    throw error;
  }
}

export const fetchUsers = async function fetchUsers() {
  return await doFetch("user-list");
};

export const triggerBooking = async function triggerBooking() {
  await doFetch("trigger-booking");
  return true;
};
