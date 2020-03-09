import React, { useState } from "react";
import {
  Form,
  Input,
  Tooltip,
  Icon,
  Cascader,
  Select,
  Row,
  Col,
  Checkbox,
  Button,
  Card
} from "antd";

import { createBooking } from "./api";

const { Option } = Select;

const days = [
  {
    value: "1",
    label: "Monday"
  },
  {
    value: "2",
    label: "Tuesday"
  },
  {
    value: "3",
    label: "Wednesday"
  },
  {
    value: "4",
    label: "Thursday"
  },
  {
    value: "5",
    label: "Friday"
  },
  {
    value: "6",
    label: "Saturday"
  },
  {
    value: "7",
    label: "Sunday"
  }
];

const courts = [
  {
    value: "2",
    label: "Court #2"
  },
  {
    value: "3",
    label: "Court #3"
  },
  {
    value: "4",
    label: "Court #4"
  },
  {
    value: "5",
    label: "Court #5"
  }
];

const times = [
  {
    value: "1:00",
    label: "13:00 - 13:45"
  },
  {
    value: "1:45",
    label: "13:45 - 14:30"
  },
  {
    value: "2:30",
    label: "14:30 - 15:15"
  },
  {
    value: "3:15",
    label: "15:15 - 16:00"
  },
  {
    value: "4:00",
    label: "16:00 - 16:45"
  },
  {
    value: "4:45",
    label: "16:45 - 17:30"
  },
  {
    value: "5:30",
    label: "17:30 - 18:15"
  },
  {
    value: "6:15",
    label: "18:15 - 19:00"
  },
  {
    value: "7:00",
    label: "19:00 - 19:45"
  },
  {
    value: "7:45",
    label: "19:45 - 20:30",
    weekendDisabled: true
  },
  {
    value: "8:30",
    label: "20:30 - 21:15",
    weekendDisabled: true
  },
  {
    value: "9:15",
    label: "21:15 - 22:00",
    weekendDisabled: true
  },
  {
    value: "10:00",
    label: "22:00 - 22:45",
    weekendDisabled: true
  }
];

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  }
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0
    },
    sm: {
      span: 16,
      offset: 8
    }
  }
};

export default function BookingAdd({ onDone, users }) {
  const [court, setCourt] = useState(courts[0].value);
  const [user, setUser] = useState(users[0].value);
  const [day, setDay] = useState(days[0].value);
  const [time, setTime] = useState(times[0].value);
  const [repeat, setRepeat] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await createBooking({
      user,
      day,
      time,
      court,
      repeat
    });
    setLoading(false);
    onDone();
  };

  const usersForSelect = users.map(user => ({
    value: user.username,
    label: user.name
  }));

  return (
    <Card style={{ margin: "20px", padding: "4px" }}>
      <Form {...formItemLayout} onSubmit={handleSubmit}>
        <Form.Item label="Court" style={{ marginBottom: "10px" }}>
          <Select
            defaultValue={courts[0].value}
            onChange={setCourt}
            disabled={loading}
          >
            {courts.map(court => (
              <Option value={court.value} key={court.value}>
                {court.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Day" style={{ marginBottom: "10px" }}>
          <Select
            defaultValue={days[0].value}
            onChange={setDay}
            disabled={loading}
          >
            {days.map(day => (
              <Option value={day.value} key={day.value}>
                {day.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          style={{ marginBottom: "10px" }}
          label={
            <span>
              Time&nbsp;
              <Tooltip title="We only support booking in the afternoon for now...">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
        >
          <Select
            defaultValue={times[0].value}
            onChange={setTime}
            disabled={loading}
          >
            {times
              .filter(
                time => !["6", "7"].includes(day) || !time.weekendDisabled
              )
              .map(time => (
                <Option value={time.value} key={time.value}>
                  {time.label}
                </Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item label="User" style={{ marginBottom: "10px" }}>
          <Select
            defaultValue={usersForSelect[0].value}
            onChange={setUser}
            disabled={loading}
          >
            {usersForSelect.map(user => (
              <Option value={user.value} key={user.value}>
                {user.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item {...tailFormItemLayout} style={{ marginBottom: "10px" }}>
          <Checkbox
            onChange={evt => setRepeat(evt.target.checked)}
            disabled={loading}
          >
            Recurring event. If checked, a new booking will be created every
            week.
          </Checkbox>
        </Form.Item>
        <Form.Item {...tailFormItemLayout} style={{ marginBottom: "10px" }}>
          <Button type="primary" htmlType="submit" disabled={loading}>
            {loading ? "Loading..." : "Create new booking"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
