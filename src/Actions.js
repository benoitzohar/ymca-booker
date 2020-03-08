import React, { useEffect, useState } from "react";
import { Button, Popconfirm } from "antd";
import firebase from "firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import moment from "moment";
import useInterval from "@use-it/interval";

import { triggerBooking } from "./api";

function Actions() {
  const [value, loading, error] = useCollection(
    firebase.firestore().collection("settings")
  );
  const [settings, setSettings] = useState();
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (value && value.docs) {
      value.docs.forEach(doc => {
        const item = doc.data();
        setSettings({
          lastRun: item.lastRun.toDate(),
          lastRunFrom: moment(item.lastRun.toDate()).fromNow()
        });
      });
    }
  }, [value]);

  useInterval(() => {
    setSettings({
      lastRunFrom: moment(settings.lastRun).fromNow()
    });
  }, 30000);

  async function attemptBooking() {
    setBooking(true);
    try {
      await triggerBooking();
    } catch (e) {
      console.error(e.message);
      alert(e.message);
    }
    setBooking(false);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "20px"
      }}
    >
      <Popconfirm
        placement="bottom"
        title="The booking is run automatically every morning every 10 minutes between 00:00 and 01:00. Are you sure you want to manually trigger a booking now?"
        onConfirm={attemptBooking}
        okText="Yes"
        cancelText="No"
        disabled={booking}
      >
        <Button type="primary" shape="round" disabled={booking}>
          {booking ? "Loading..." : "Trigger booking"}
        </Button>
      </Popconfirm>
      <div style={{ textAlign: "center" }}>
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>Loading...</span>}
        {settings && <span>Last attempt: {settings.lastRunFrom}</span>}
      </div>
    </div>
  );
}

export default Actions;
