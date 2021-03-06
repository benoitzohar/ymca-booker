import React, { useEffect, useState } from "react";
import firebase from "firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import moment from "moment";
import { Collapse, Timeline, Tag, Alert, Icon, Tooltip } from "antd";

import BookingAdd from "./BookingAdd";

const tagColors = {
  PENDING: "cyan",
  RUNNING: "volcano",
  SUCCESS: "green",
  FAILURE: "red"
};

export default function Bookings({ users }) {
  const [value, loading, error] = useCollection(
    firebase
      .firestore()
      .collection("bookings")
      .orderBy("updatedAt", "asc")
      .limit(10)
  );
  const [bookings, setBookings] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  function getUserName(username) {
    const user = users && users.find(user => user.username === username);
    return (user && user.name) || username;
  }

  useEffect(() => {
    if (value) {
      setBookings(
        value.docs
          .map(doc => {
            const booking = doc.data();

            return {
              ...booking,
              id: doc.id,
              rawDate: new Date(booking.date),
              date: moment(new Date(booking.date))
                .utc()
                .format("dddd D MMMM"),
              userName: getUserName(booking.user),
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
          .sort((a, b) => {
            if (a.rawDate < b.rawDate) {
              return 1;
            }
            if (a.rawDate > b.rawDate) {
              return -1;
            }
            return 0;
          })
      );
    }
  }, [value, users]);

  const panels =
    bookings &&
    bookings.map((booking, index) => {
      const header = (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "15px" }}>
              <b>{booking.date}</b> at {booking.time}pm
            </div>
            <div style={{ fontSize: "13px" }}>
              Court #{booking.court} | {booking.userName}
              {booking.repeat ? (
                <span>
                  {" "}
                  |{" "}
                  <Tooltip title="Recurring booking">
                    <Icon type="sync" style={{ marginLeft: "4px" }} />
                  </Tooltip>
                </span>
              ) : null}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Tag color={tagColors[booking.status]}>{booking.status}</Tag>
          </div>
        </div>
      );

      return (
        <Collapse.Panel header={header} key={index}>
          <div>
            {booking.repeat ? (
              <div style={{ margin: "20px" }}>
                <Alert
                  message="ℹ️ This booking is recurring: a new booking will automatically be created for the next week when this one is done."
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
            {booking.attempts && booking.status !== "FAILURE" && (
              <div style={{ margin: "20px" }}>
                <Alert
                  message={`⚠️ ${booking.attempts} failed attempt${
                    booking.attempts > 1 ? "s" : ""
                  }. We will try again in 10 minutes and cancel this booking after 6 failures.`}
                  type="warning"
                />
              </div>
            )}
            {booking.logs && (
              <>
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
              </>
            )}
          </div>
        </Collapse.Panel>
      );
    });
  return (
    <div>
      <div style={{ display: "flex" }}>
        <h3>Bookings</h3>
        <div
          onClick={() => setShowAdd(!showAdd)}
          style={{ marginLeft: "10px", padding: "2px" }}
        >
          <Icon type="plus-circle" theme="twoTone" />
        </div>
      </div>
      {showAdd && <BookingAdd onDone={() => setShowAdd(false)} users={users} />}
      {error && <strong>Error: {JSON.stringify(error)}</strong>}
      {loading && <span>Loading...</span>}
      <Collapse>{panels}</Collapse>
    </div>
  );
}
