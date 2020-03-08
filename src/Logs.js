import React from "react";
import { Timeline } from "antd";

function Logs({ logs }) {
  console.log("[BZ] logs:", logs);
  return (
    <div className="Logs">
      <Timeline>
        {logs.map(log => (
          <Timeline.Item key={log.id}>
            <p>{log.createdAt}</p>
            <p>{log.message}</p>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
}

export default Logs;
