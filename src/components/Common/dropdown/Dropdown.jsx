import React, { useEffect, useState } from "react";
import css from "./dropdown.module.scss";

function Dropdown(props) {
  const { list, itemClickHandle, itemSelected } = props;

  const [isOpenDropdown, setIsOpentDropdown] = useState(false);

  const renderSelector = function () {
    if (!itemSelected) return;
    return (
      <>
        <div className={css["imageContainer"]}>
          <img src={itemSelected.image} alt={itemSelected.content} />
        </div>
        <div className={css["contentContainer"]}>{itemSelected.content}</div>
        <div className={css["iconDownContainer"]}>
          <i className="fa-solid fa-caret-down"></i>
        </div>
      </>
    );
  };

  const renderMenu = function () {
    if (!list || list.length <= 0) return;
    return list.map((item) => (
      <div
        key={item.id}
        onClick={rowClickHandle.bind(null, item)}
        className={css["dropdownMenuItem"]}
      >
        <div className={`${css["dropdownMenuItem__imageContainer"]}`}>
          <img src={item.image} alt={item.content} />
        </div>
        <div className={`${css["dropdownMenuItem__content"]}`}>
          {item.content}
        </div>
      </div>
    ));
  };

  const rowClickHandle = function (itemDropdown, ev) {
    ev.stopPropagation();
    itemClickHandle(itemDropdown, ev.currentTarget);
    setIsOpentDropdown(false);
  };

  const renderClassShowMenu = function () {
    return isOpenDropdown ? css["show"] : "";
  };
  const dropdownCLickHandle = function (ev) {
    ev.stopPropagation();
    setIsOpentDropdown((s) => !s);
  };

  const closeDropdown = function () {
    setIsOpentDropdown(false);
  };

  useEffect(() => {
    document.addEventListener("click", closeDropdown);

    return () => {
      document.removeEventListener("click", closeDropdown);
    };
  }, []);

  return (
    <div onClick={dropdownCLickHandle} className={css["dropdown"]}>
      {renderSelector()}
      <div
        className={`${css["dropdownMenuContainer"]}  ${renderClassShowMenu()}`}
      >
        <div className={css["dropdownMenu"]}>{renderMenu()} </div>
      </div>
    </div>
  );
}

export default Dropdown;
