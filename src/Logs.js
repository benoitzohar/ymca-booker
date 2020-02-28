import React from "react";

function Logs({ logs }) {
  return (
    <div className="Logs">
      {logs.map(log => (
        <div className="log">{log.message}</div>
      ))}
    </div>
  );
}

export default Logs;
