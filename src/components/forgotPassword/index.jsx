import React, { useState } from "react";
import { Button } from "antd";
function ForgotPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const renderClassShowEyePassword = function () {
    return showPassword ? "" : "--d-none";
  };
  const renderClassShowEyeSlashPassword = function () {
    return showPassword ? "--d-none" : "";
  };
  const eyePasswordToggle = function () {
    setShowPassword((s) => !s);
  };
  const renderTypePassword = function () {
    return showPassword ? "text" : "password";
  };
  const renderClassShowEyePasswordConfirm = function () {
    return showPasswordConfirm ? "" : "--d-none";
  };
  const renderClassShowEyeSlashPasswordConfirm = function () {
    return showPasswordConfirm ? "--d-none" : "";
  };
  const eyePasswordConfirmToggle = function () {
    setShowPasswordConfirm((s) => !s);
  };
  const renderTypePasswordConfirm = function () {
    return showPasswordConfirm ? "text" : "password";
  };

  return (
    <div className="login-register">
      <div className="container">
        <div className="box">
          <h2 className="title">Change Password</h2>
          <form>
            <div className="field">
              <label htmlFor="password">New Password</label>
              <input id="password" type={renderTypePassword()} />
              <span
                onClick={eyePasswordToggle}
                id="eyeShow"
                className={renderClassShowEyePassword()}
              >
                <i className="fa-regular fa-eye"></i>
              </span>
              <span
                onClick={eyePasswordToggle}
                id="eyeHide"
                className={renderClassShowEyeSlashPassword()}
              >
                <i className="fa-solid fa-eye-slash"></i>
              </span>
            </div>
            <div className="field">
              <label htmlFor="passwordConfirm">New Password Confirm </label>
              <input type={renderTypePasswordConfirm()} id="passwordConfirm" />
              <span
                onClick={eyePasswordConfirmToggle}
                id="eyeShow"
                className={renderClassShowEyePasswordConfirm()}
              >
                <i className="fa-regular fa-eye"></i>
              </span>
              <span
                onClick={eyePasswordConfirmToggle}
                id="eyeHide"
                className={renderClassShowEyeSlashPasswordConfirm()}
              >
                <i className="fa-solid fa-eye-slash"></i>
              </span>
            </div>
            <Button
              loading={false}
              type="primary"
              size="large"
              className="loginBtn"
              onClick={() => {}}
              htmlType="submit"
            >
              Change
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
