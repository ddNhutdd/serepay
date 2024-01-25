import React, { useState } from "react";
import ChangePassword from "./changePass";
import ChangePassSuccess from "./changePassSuccess";

function ForgotPassword() {
  const [showSuccess, setShowSuccess] = useState(false);
  return (
    <div className="login-register">
      <div className="container">
        {showSuccess ? (
          <ChangePassSuccess />
        ) : (
          <ChangePassword showSuccess={setShowSuccess} />
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
