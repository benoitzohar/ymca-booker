import React from "react";
import { Timeline } from "antd";

function Logs({ logs }) {
  return (
    <div className="Logs">
      <Timeline>
        {logs.map(log => (
          <Timeline.Item>
            <p>{log.createdAt.toDate()}</p>
            <p>{log.message}</p>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
}

export default Logs;
