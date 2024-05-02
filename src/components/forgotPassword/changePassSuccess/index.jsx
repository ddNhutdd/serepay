import React from "react";
import { Button } from "src/components/Common/Button";
import { useHistory } from "react-router-dom";
import { url } from "src/constant";

function ChangePassSuccess() {
  const history = useHistory();

  const redirectLogin = function () {
    history.push(url.login);
    return;
  };

  return (
    <div className="box">
      <h2 className="title">Change Password Success</h2>
      <p>
        Change password successfully. You can now log in to your account with a
        new password. Click the button below to log in.
      </p>
      <Button onClick={redirectLogin}>Go to the login page</Button>
    </div>
  );
}

export default ChangePassSuccess;
