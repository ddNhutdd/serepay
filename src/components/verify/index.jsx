import React from "react";
import { Button } from "../Common/Button";
import { Spin } from "antd";

function Verify() {
  return (
    <div className="verify">
      <div className="container">
        <p>
          <Spin />
        </p>
        <p>
          Successfully authenticated account. Click on the button below or wait
          5 seconds to go to the login page
        </p>
        <Button>Go to the login page</Button>
      </div>
    </div>
  );
}

export default Verify;
