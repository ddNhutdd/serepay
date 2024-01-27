const getButtonClasses = (type) => {
  switch (type) {
    case buttonClassesType.outline:
      return "buttonContainer--outline";

    case buttonClassesType.transparent:
      return "buttonContainer--transparent";

    case buttonClassesType.success:
      return "buttonContainer--green";

    default:
      return "buttonContainer--primary";
  }
};

export const buttonClassesType = {
  outline: "outline",
  transparent: "transparent",
  primary: "primary",
  success: "success",
};

export const htmlType = {
  button: "button",
  submit: "submit",
};

/**
 *
 * @param {type}: primary, outline,
 * @returns
 */
export const Button = ({
  className,
  loading = false,
  onClick,
  id,
  style,
  children,
  name,
  type = "primary",
  disabled,
  htmlSubmit = htmlType,
}) => {
  let typeClassesDefault = getButtonClasses(type);
  const renderClassLoader = function () {
    return loading ? "" : "--d-none";
  };
  const renderDisable = function () {
    return loading ? true : disabled;
  };
  return (
    <button
      id={id}
      className={typeClassesDefault + " " + className}
      style={style}
      onClick={onClick}
      name={name}
      disabled={renderDisable()}
      type={htmlSubmit}
    >
      <div className={`loader ${renderClassLoader()}`}></div>
      {children}
    </button>
  );
};
