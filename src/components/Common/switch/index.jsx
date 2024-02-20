import React, { useEffect, useState } from "react";
import css from "./switch.module.scss";

function Switch(props) {
  const { on = false, onChange = () => {}, onClick = () => {} } = props;

  const [checked, setChecked] = useState(on);

  const renderClassActiveContainer = function () {
    return checked ? css["active"] : "";
  };
  const renderClassActiveButton = function () {
    return checked ? css["active"] : "";
  };
  const onChangeHandle = function () {
    onChange(checked);
  };
  const onCLickHandle = function (ev) {
    ev.stopPropagation();
    setChecked((s) => !s);
    onClick(ev);
  };

  useEffect(() => {
    onChangeHandle();
  }, [checked]);

  return (
    <div
      onClick={onCLickHandle}
      className={`${css["switchContainer"]} ${renderClassActiveContainer()}`}
    >
      <div
        className={`${css["switchButton"]} ${renderClassActiveButton()}`}
      ></div>
    </div>
  );
}

export default Switch;
