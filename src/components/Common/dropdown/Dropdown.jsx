import React, { useEffect, useState } from "react";
import css from "./dropdown.module.scss";
import { getLocalStorage } from "src/util/common";
import { defaultLanguage, localStorageVariable } from "src/constant";
import { useTranslation } from "react-i18next";
import i18n from "src/translation/i18n";

function Dropdown(props) {
  const { list, itemClickHandle, itemSelected, id } = props;
  const { t } = useTranslation();

  const [isOpenDropdown, setIsOpentDropdown] = useState(false);
  const [dropdownSelectorHeight, setDropdownSelectorHeight] = useState(0);

  const renderSelector = function () {
    if (!itemSelected) return;
    const renderRandom = function () {
      if (itemSelected.id === -1) {
        return <div className={css["contentContainer"]}>{t("random")}</div>;
      } else {
        return (
          <div className={css["contentContainer"]}>{itemSelected.content}</div>
        );
      }
    };
    return (
      <>
        <div
          className={`${css["imageContainer"]} ${hidenElement(
            itemSelected.image
          )}`}
        >
          <img src={itemSelected.image} alt={itemSelected.content} />
        </div>
        {renderRandom()}
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

    const renderRandomText = function (item) {
      return item.id === -1 ? t("random") : item.content;
    };

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
          {renderRandomText(item)}
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
  const dropdownInnerCLickHandle = function (ev) {
    ev.stopPropagation();
    setIsOpentDropdown((s) => !s);
  };
  const closeDropdown = function () {
    setIsOpentDropdown(false);
  };
  const observeHeightSelector = function () {
    const setHeightSelector = function () {
      let element = document.getElementById(id);
      if (!element) return;
      let height = element.offsetHeight;
      setDropdownSelectorHeight(height);
    };
    let observer = new ResizeObserver(setHeightSelector);
    observer.observe(document.getElementById(id));
    return observer;
  };

  useEffect(() => {
    document.addEventListener("click", closeDropdown, true);
    const observer = observeHeightSelector();

    const language =
      getLocalStorage(localStorageVariable.lng) || defaultLanguage;
    i18n.changeLanguage(language);

    return () => {
      document.removeEventListener("click", closeDropdown);
      observer.disconnect();
    };
  }, []);

  return (
    <div id={id} onClick={dropdownInnerCLickHandle} className={css["dropdown"]}>
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
