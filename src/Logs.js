import React from "react";
import { Timeline } from "antd";
import firebase from "firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import moment from "moment";

function Logs() {
  const [value, loading, error] = useCollection(
    firebase
      .firestore()
      .collection("logs")
      .orderBy("createdAt", "desc")
      .limit(50)
  );

  const logs =
    value &&
    value.docs.map(doc => {
      const log = doc.data();
      const createdAt = moment(log.createdAt.toDate());
      return {
        ...log,
        id: doc.id,
        createdAt: `${createdAt.fromNow()} (${createdAt.format(
          "dddd, MMMM Do, h:mm:ss a"
        )})`
      };
    });

  return (
    <div style={{ marginTop: "10px" }}>
      <h3>Bot Logs</h3>
      <div style={{ background: "#fff", padding: 16, minHeight: 380 }}>
        <Timeline>
          {error && <strong>Error: {JSON.stringify(error)}</strong>}
          {loading && <span>Loading...</span>}
          {logs &&
            logs.map(log => (
              <Timeline.Item key={log.id}>
                <p>{log.createdAt}</p>
                <p>{log.message}</p>
              </Timeline.Item>
            ))}
        </Timeline>
      </div>
    </div>
  );
}

export default Logs;
