import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import firebase from "firebase";
import "firebase/firestore";

import Logs from "./Logs";
import Actions from "./Actions";
import Bookings from "./Bookings";
import Password from "./Password";
import { fetchUsers } from "./api";

import "./App.css";

const firebaseConfig = {
  apiKey: "AIzaSyCYpybXYpojsNR4jEXtnPWwlvtz4czN1iw",
  authDomain: "ymca-booker.firebaseapp.com",
  databaseURL: "https://ymca-booker.firebaseio.com",
  projectId: "ymca-booker",
  storageBucket: "ymca-booker.appspot.com",
  messagingSenderId: "293180352614",
  appId: "1:293180352614:web:1243a8530e33d8e1bd25a7"
};
firebase.initializeApp(firebaseConfig);

const { Header, Content } = Layout;

function App() {
  const [token, setLocalToken] = useState(localStorage.getItem("TOKEN"));
  const [users, setUsers] = useState([]);

  function setToken(newToken) {
    localStorage.setItem("TOKEN", newToken);
    setLocalToken(newToken);
  }

  useEffect(() => {
    if (token) {
      fetchUsers()
        .then(setUsers)
        .catch(err => {
          console.error(err.message);
          setLocalToken(null);
        });
    }
  }, [token]);

  return (
    <Layout>
      <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
        <h1 style={{ color: "white", textAlign: "center", fontSize: "30px" }}>
          YMCA Booker
        </h1>
      </Header>
      <Content style={{ padding: "0 10px", marginTop: "80px" }}>
        <Bookings users={users} />
        <Actions />
        <Logs />
      </Content>
      {!token && <Password setToken={setToken} />}
    </Layout>
  );
}

export default App;
