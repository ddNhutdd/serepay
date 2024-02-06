import React, { useEffect, useState } from "react";
import css from "./dropdown.module.scss";

function Dropdown(props) {
  const { list, itemClickHandle, itemSelected, id } = props;

  const [isOpenDropdown, setIsOpentDropdown] = useState(false);
  const [dropdownSelectorHeight, setDropdownSelectorHeight] = useState(0);

  const renderSelector = function () {
    if (!itemSelected) return;
    return (
      <>
        <div
          className={`${css["imageContainer"]} ${hidenElement(
            itemSelected.image
          )}`}
        >
          <img src={itemSelected.image} alt={itemSelected.content} />
        </div>
        <div className={css["contentContainer"]}>{itemSelected.content}</div>
        <div className={css["iconDownContainer"]}>
          <i className="fa-solid fa-caret-down"></i>
        </div>
      </>
    );
  };
  const hidenElement = function (image) {
    return image ? "" : "--d-none";
  };
  const renderMenu = function () {
    if (!list || list.length <= 0) return;

    return list.map((item) => (
      <div
        key={item.id}
        onClick={rowClickHandle.bind(null, item)}
        className={css["dropdownMenuItem"]}
      >
        <div
          className={`${css["dropdownMenuItem__imageContainer"]} ${hidenElement(
            item.image
          )}`}
        >
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
  const observeHeightSelector = function () {
    const setHeightSelector = function () {
      let element = document.getElementById(id);
      let height = element.offsetHeight;
      setDropdownSelectorHeight(height);
    };
    let observer = new ResizeObserver(setHeightSelector);
    observer.observe(document.getElementById(id));
    return observer;
  };

  useEffect(() => {
    document.addEventListener("click", closeDropdown);
    const observer = observeHeightSelector();

    return () => {
      document.removeEventListener("click", closeDropdown);
      observer.disconnect();
    };
  }, []);

  return (
    <div id={id} onClick={dropdownCLickHandle} className={css["dropdown"]}>
      {renderSelector()}
      <div
        style={{ top: dropdownSelectorHeight }}
        className={`${css["dropdownMenuContainer"]} ${renderClassShowMenu()}`}
      >
        <div className={css["dropdownMenu"]}>{renderMenu()} </div>
      </div>
    </div>
  );
}

export default Dropdown;
