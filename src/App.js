import React, { useState, useEffect } from "react";

import Logs from "./Logs";
import { fetchLogs } from "./api";

import "./App.css";

function App() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs().then(setLogs);
  }, []);

  return (
    <div className="App">
      <Logs logs={logs} />
    </div>
  );
}

export default App;
