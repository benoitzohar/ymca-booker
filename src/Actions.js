import React, { useEffect, useState } from "react";
import { Button } from "antd";
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
    <div style={{ display: "flex", flexDirection: "column" }}>
      {error && <strong>Error: {JSON.stringify(error)}</strong>}
      {loading && <span>Loading...</span>}
      <Button
        type="primary"
        shape="round"
        onClick={attemptBooking}
        disabled={booking}
      >
        {booking ? "Loading..." : "Trigger booking"}
      </Button>
      {settings && <span>Last attempt: {settings.lastRunFrom}</span>}
    </div>
  );
}

export default Actions;
