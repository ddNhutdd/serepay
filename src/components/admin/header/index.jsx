import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Switch } from "antd";
function Header() {
  //
  const overlayElement = useRef();
  const settingBarElement = useRef();
  //
  const showSettingBar = function () {
    overlayElement.current.classList.remove("--d-none");
    settingBarElement.current.classList.add("show");
  };
  const closeSettingBar = function () {
    overlayElement.current.classList.add("--d-none");
    settingBarElement.current.classList.remove("show");
  };
  const showMainBar = function () {
    const sidebar = document.querySelector(".admin-sidebar");
    const mainContent = document.querySelector(".adminTemplate__content-main");
    sidebar.classList.toggle("show");
    mainContent.classList.toggle("small");
  };
  //
  return (
    <>
      <div className="admin-header">
        <span className="admin-header__bar">
          <i onClick={showMainBar} className="fa-solid fa-bars"></i>
        </span>
        <Link className="admin-header__logo" to="/">
          <img
            className="admin-header__logo-img"
            src={process.env.PUBLIC_URL + "/img/logoWhite.png"}
            alt="logo"
          />
        </Link>
        <button
          onClick={showSettingBar}
          className="admin-header__settings --d-none"
        >
          <i className="fa-solid fa-gear"></i>
          <span>Setting</span>
        </button>
        <div
          onClick={closeSettingBar}
          ref={overlayElement}
          className="admin-header__overlay --d-none"
        ></div>
        <div ref={settingBarElement} className="admin-header__setting-bar ">
          <div className="admin-header__setting-bar-header">
            <i onClick={closeSettingBar} className="fa-solid fa-xmark"></i>
            <span className="admin-header__setting-bar-header-text">
              Setting
            </span>
          </div>
          <div className="admin-header__setting-bar-body">
            <div className="admin-header__setting-bar-body-item">
              <div>Auto Chart</div>
              <div>
                <Switch defaultChecked onChange={() => {}} />
              </div>
            </div>
            <div className="admin-header__setting-bar-body-item">
              <div>Message</div>
              <div>
                <Switch defaultChecked onChange={() => {}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Header;
