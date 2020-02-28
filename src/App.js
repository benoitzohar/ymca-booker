import React, { useState, useEffect } from "react";

import Logs from "./Logs";
import Password from "./Password";
import { fetchLogs } from "./api";

import "./App.css";

function App() {
  const [token, setLocalToken] = useState(localStorage.getItem("TOKEN"));
  const [logs, setLogs] = useState([]);
  console.log("[BZ] token:", token);

  function setToken(newToken) {
    localStorage.setItem("TOKEN", newToken);
    setLocalToken(newToken);
  }

  useEffect(() => {
    if (token) {
      fetchLogs()
        .then(setLogs)
        .catch(() => setToken(""));
    }
  }, [token]);

  return (
    <div className="App">
      {!token && <Password setToken={setToken} />}
      <Logs logs={logs} />
    </div>
  );
}

export default App;
