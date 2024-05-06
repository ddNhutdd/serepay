import React, { useEffect, useState } from "react";
import css from "./switch.module.scss";

function Switch(props) {
  const {
    on = false,
    onClick = () => { },
    loading = false,
    disabled = false,
  } = props;



  const renderClassActiveContainer = function () {
    return on ? css["active"] : "";
  };
  const renderClassActiveButton = function () {
    return on ? css["active"] : "";
  };
  const renderDisabled = () => {
    return disabled ? css['disabled'] : '';
  }
  const renderLoading = () => {
    return loading ? css.loading : ''
  }

  const onClickHandle = () => {
    onClick();
  }


  return (
    <div
      onClick={onClickHandle}
      className={`
        ${css["switchContainer"]} 
        ${renderClassActiveContainer()}
        ${renderDisabled()}
        ${renderLoading()}
      `}
    >
      <div
        className={`${css["switchButton"]} ${renderClassActiveButton()}`}
      >
        <div className={css.switchLoader}></div>
      </div>
    </div>
  );
}

export default Switch;
