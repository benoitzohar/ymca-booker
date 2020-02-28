import React, { useEffect } from "react";
import { Modal, Input } from "antd";

function Password({ setToken }) {
  useEffect(() => {
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
  }, [setToken]);

  return <div className="Password"></div>;
}

export default Password;
