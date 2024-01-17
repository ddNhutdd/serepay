const getButtonClasses = (type) => {
  switch (type) {
    case buttonClassesType.outline:
      return "buttonContainer--outline";

    case buttonClassesType.transparent:
      return "buttonContainer--transparent";

    default:
      return "buttonContainer--primary";
  }
};

export const buttonClassesType = {
  outline: "outline",
  transparent: "transparent",
  primary: "primary",
};

/**
 *
 * @param {type}: primary, outline,
 * @returns
 */
export const Button = ({
  className,
  onClick,
  id,
  style,
  children,
  name,
  type = "primary",
  disabled,
}) => {
  let typeClassesDefault = getButtonClasses(type);

  return (
    <button
      id={id}
      className={typeClassesDefault + " " + className}
      style={style}
      onClick={onClick}
      name={name}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
