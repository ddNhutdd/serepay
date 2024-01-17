import React from "react";
export const Input = React.forwardRef(
  (
    {
      name,
      value,
      onChange,
      type,
      placeholder,
      id,
      style,
      onFocus,
      disabled,
      errorMes,
      className,
    },
    ref
  ) => {
    return (
      <>
        <input
          className={"inputContainer--default " + className}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          type={type}
          placeholder={placeholder}
          style={style}
          id={id}
          ref={ref}
          name={name}
          disabled={disabled}
        />
        {typeof errorMes === "string" && (
          <span className="errorMessage--default">{errorMes}</span>
        )}
      </>
    );
  }
);
