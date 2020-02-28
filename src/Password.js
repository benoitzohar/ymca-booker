import React, { useState, useEffect } from "react";
import { Modal, Input } from "antd";

function Password({ setToken }) {
  const [token, setLocalToken] = useState("");

  useEffect(() => {
    if (!token) {
      Modal.info({
        title: "Please provide el password",
        content: (
          <div>
            <Input type="text" id="token" />
          </div>
        ),
        onOk() {
          setToken(document.querySelector("#token").value);
        }
      });
    }
  }, [token, setToken]);

  return <div className="Password"></div>;
}

export default Password;
