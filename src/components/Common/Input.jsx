import React, { useState } from "react";

export const inputType = {
  text: "text",
  password: "password",
  number: "number",
};

export const inputColor = {
  green: "green",
  red: "red",
};

export const Input = React.forwardRef(
  (
    {
      name,
      value,
      onChange,
      type = inputType.text,
      color,
      placeholder,
      id,
      style,
      onFocus,
      disabled,
      errorMes,
      className,
      require,
      min,
      max,
      asame
    },
    ref
  ) => {
    const [showPass, setShowPass] = useState(false);

    const renderEye = function () {
      return (
        type === inputType.password && (
          <>
            <span
              onClick={eyeToggle}
              className={`inputEye--default ${renderClassShowEye()}`}
            >
              <i className="fa-regular fa-eye"></i>
            </span>
            <span
              onClick={eyeToggle}
              className={`inputEye--default ${renderClassShowEyeSlash()}`}
            >
              <i className="fa-solid fa-eye-slash"></i>
            </span>
          </>
        )
      );
    };
    const renderClassShowEye = function () {
      return showPass ? "" : "--d-none";
    };
    const renderClassShowEyeSlash = function () {
      return showPass ? "--d-none" : "";
    };
    const eyeToggle = function () {
      setShowPass((s) => !s);
    };
    const renderType = function () {
      if (type === inputType.text || type === inputType.number) return "text";
      if (showPass) return "text";
      return "password";
    };
    const renderClassNumber = function () {
      return type === inputType.number ? "fontSizeLarge" : "";
    };
    const renderClassColor = function () {
      switch (color) {
        case inputColor.green:
          return "green";
        case inputColor.red:
          return "red";
        default:
          return "";
      }
    };

    return (
      <div className="inputContainer--default">
        <input
          className={`inputCustom--default ${renderClassNumber()} ${renderClassColor()} ${className}`}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={placeholder}
          type={renderType()}
          style={style}
          id={id}
          ref={ref}
          name={name}
          disabled={disabled}
          data-require={JSON.stringify(require)}
          data-min={JSON.stringify(min)}
          data-max={JSON.stringify(max)}
          data-asame={JSON.stringify(asame)}
        />
        {typeof errorMes === "string" && (
          <span className="errorMessage--default">{errorMes}</span>
        )}
        {renderEye()}
      </div>
    );
  }
);
