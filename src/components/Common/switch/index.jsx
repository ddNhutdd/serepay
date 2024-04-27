import React, { useEffect, useState } from "react";
import css from "./switch.module.scss";

function Switch(props) {
  const {
    on = false,
    onChange = () => { },
    onClick = () => { },
    loading = false,
    disabled = false,
  } = props;



  const renderClassActiveContainer = function () {
    return checked ? css["active"] : "";
  };
  const renderClassActiveButton = function () {
    return checked ? css["active"] : "";
  };
  const renderDisabled = () => {
    return disabled ? css['disabled'] : '';
  }
  const renderLoading = () => {
    return loading ? css.loading : ''
  }


  const [checked, setChecked] = useState(on);


  const onChangeHandle = function () {
    onChange(checked);
  };

  const onClickHandle = () => {
    onClick();
    setChecked(state => !state);
  }

  useEffect(() => {
    onChangeHandle();
  }, [checked]);

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
