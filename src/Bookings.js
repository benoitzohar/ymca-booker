import React, { useEffect, useState } from "react";
import { Collapse, Timeline, Tag, Alert } from "antd";
import firebase from "firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import moment from "moment";

const tagColors = {
  PENDING: "cyan",
  RUNNING: "volcano",
  SUCCESS: "green",
  FAILURE: "red"
};

export default function Bookings() {
  const [value, loading, error] = useCollection(
    firebase.firestore().collection("bookings")
  );
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (value) {
      setBookings(
        value.docs.map(doc => {
          const booking = doc.data();

          const day = moment()
            .day(booking.day)
            .format("dddd");

          return {
            ...booking,
            id: doc.id,
            title: `Court #${booking.court} at ${booking.time}pm on ${day}`,
            logs:
              booking.logs &&
              booking.logs.reverse().map(log => {
                const date = new Date(log.createdAt.seconds * 1000);
                return {
                  ...log,
                  date,
                  dateFrom: moment(date).fromNow()
                };
              })
          };
        })
      );
    }
  }, [value]);

  const panels =
    bookings &&
    bookings.map((booking, index) => {
      const header = (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{booking.title}</span>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Tag color={tagColors[booking.status]}>{booking.status}</Tag>
          </div>
        </div>
      );

      return (
        <Collapse.Panel header={header} key={index}>
          {booking.logs && (
            <div>
              {booking.repeat ? (
                <div style={{ margin: "20px" }}>
                  <Alert
                    message="ℹ️ This booking is recurring: a new booking will automatically be created when this one is done."
                    type="info"
                  />
                </div>
              ) : (
                <div style={{ margin: "20px" }}>
                  <Alert
                    message="ℹ️ This is a one-time only booking."
                    type="info"
                  />
                </div>
              )}
              {booking.attempts && (
                <div style={{ margin: "20px" }}>
                  <Alert
                    message={`${booking.attempts} attempt${
                      booking.attempts > 1 ? "s" : ""
                    }`}
                    type="warning"
                  />
                </div>
              )}
              <h3>Timeline</h3>
              <Timeline>
                {booking.logs &&
                  booking.logs.map((log, index) => (
                    <Timeline.Item key={index}>
                      <p>{log.dateFrom}</p>
                      <p>{log.message}</p>
                    </Timeline.Item>
                  ))}
              </Timeline>
            </div>
          )}
        </Collapse.Panel>
      );
    });
  return (
    <div className="Bookings">
      <h3>Bookings</h3>
      {error && <strong>Error: {JSON.stringify(error)}</strong>}
      {loading && <span>Loading...</span>}
      <Collapse>{panels}</Collapse>
    </div>
  );
}
