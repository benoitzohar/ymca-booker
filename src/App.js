import React, { useState, useEffect } from "react";
import { Layout, Menu, Icon, Breadcrumb } from "antd";

import Logs from "./Logs";
import Password from "./Password";
import { fetchLogs } from "./api";

import "./App.css";

const { Header, Content } = Layout;

function App() {
  const [token, setLocalToken] = useState(localStorage.getItem("TOKEN"));
  const [logs, setLogs] = useState([]);

  function setToken(newToken) {
    localStorage.setItem("TOKEN", newToken);
    setLocalToken(newToken);
  }

  useEffect(() => {
    if (token) {
      fetchLogs()
        .then(setLogs)
        .catch(() => {
          /* setToken("") */
        });
    }
  }, [token]);

  return (
    <Layout>
      <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["2"]}
          style={{ lineHeight: "64px" }}
        >
          <Menu.Item key="1">
            <Icon type="appstore-o" />
            <span className="nav-text">YMCA Booker</span>
          </Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: "0 50px", marginTop: 64 }}>
        <Breadcrumb style={{ margin: "16px 0" }}></Breadcrumb>
        <div style={{ background: "#fff", padding: 24, minHeight: 380 }}>
          <Logs logs={logs} />
        </div>
      </Content>
      {!token && <Password setToken={setToken} />}
    </Layout>
  );
}

export default App;
