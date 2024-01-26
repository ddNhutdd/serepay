import { Spin } from "antd";
import React, { useEffect, useState, useRef } from "react";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { Input } from "src/components/Common/Input";
import { api_status } from "src/constant";
import { getConfigAdmin, updateConfigAdmin } from "src/util/adminCallApi";

function ConfigData() {
  const [loadMainDataStatus, setLoadMainDataStatus] = useState(
    api_status.pending
  );
  const [mainData, setMainData] = useState([]);

  const listKey = useRef(["privateKeyBNB", "addressBNB", "addressUSDT"]);

  const renderClassShowMainData = function () {
    return loadMainDataStatus === api_status.fetching ? "--d-none" : "";
  };
  const renderClassSpinTable = function () {
    return loadMainDataStatus === api_status.fetching ? "" : "--d-none";
  };
  const fetchApiLoadMainData = function () {
    return new Promise((resolve, reject) => {
      if (loadMainDataStatus === api_status.fetching) resolve(true);
      setLoadMainDataStatus(() => api_status.fetching);
      getConfigAdmin()
        .then((resp) => {
          const listData = resp.data.data.filter(
            (item) =>
              item.name === listKey.current.at(0) ||
              item.name === listKey.current.at(1) ||
              item.name === listKey.current.at(2)
          );
          const result = listData.map((item) => ({
            ...item,
            ["fetching"]: false,
          }));
          setMainData(() => result);
          console.log(result);
          setLoadMainDataStatus(() => api_status.fulfilled);
        })
        .catch((error) => {
          console.log(error);
          setLoadMainDataStatus(() => api_status.rejected);
        });
    });
  };
  const renderTable = function () {
    if (!mainData || mainData.length <= 0) return;
    return mainData.map((item) => (
      <tr
        key={item.id}
        onClick={rowClickHandle}
        data-name={item.name}
        data-note={item.note}
      >
        <td>{item.name}</td>
        <td>
          <div>
            <span id={`note${item.name}`}>{item.note}</span>
            <Input id={`input${item.name}`} className="--d-none" />
          </div>
        </td>
        <td>
          <div className="configData__action">
            <Button
              loading={item.fetching}
              onClick={saveClickHandle.bind(null, item.name)}
              id={`save${item.name}`}
              className="--d-none"
            >
              Save
            </Button>
            <Button
              disabled={item.fetching}
              id={`cancel${item.name}`}
              className="--d-none"
              type={buttonClassesType.outline}
              onClick={cancelClickHandle}
            >
              Cancel
            </Button>
          </div>
        </td>
      </tr>
    ));
  };
  const rowClickHandle = function (e) {
    const hideClass = "--d-none";
    const row = e.currentTarget;
    const { name, note } = row.dataset;

    !row.querySelector(`#note${name}`).classList.contains(hideClass) &&
      row.querySelector(`#note${name}`).classList.add(hideClass);
    row.querySelector(`#save${name}`).classList.remove(hideClass);
    row.querySelector(`#cancel${name}`).classList.remove(hideClass);

    const inputElement = row.querySelector(`#input${name}`);
    inputElement.classList.remove(hideClass);
    inputElement.value = note;
  };
  const cancelClickHandle = function (e) {
    e.stopPropagation();
    const row = e.target.closest("tr");
    hideRow(row);
  };
  const saveClickHandle = function (name, e) {
    e.stopPropagation();
    setFetchingMainData(name, true);
    const input = e.target.closest("tr").querySelector("input");
    fetchApiUpdataData(name, input.value);
  };
  const setFetchingMainData = function (name, fetching) {
    const newData = [...mainData];
    const findedItem = newData.find((item) => item.name === name);
    findedItem.fetching = fetching;
    setMainData(() => newData);
  };
  const fetchApiUpdataData = function (name, note) {
    return new Promise((resolve, reject) => {
      updateConfigAdmin({
        name,
        note,
      })
        .then((resp) => {
          const row = document.querySelector(`tr[data-name="${name}"]`);
          row.dataset.note = note;
          hideRow(row);
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setFetchingMainData(name, false);
        });
    });
  };
  const hideRow = function (row) {
    const hideClass = "--d-none";
    const { name, note } = row.dataset;

    const saveButton = row.querySelector(`#save${name}`);
    !saveButton.classList.contains(hideClass) &&
      saveButton.classList.add(hideClass);
    const cancelButton = row.querySelector(`#cancel${name}`);
    !cancelButton.classList.contains(hideClass) &&
      cancelButton.classList.add(hideClass);

    row.querySelector(`#note${name}`).classList.remove(hideClass);
    row.querySelector(`#note${name}`).innerHTML = note;

    const inputRow = row.querySelector(`#input${name}`);
    !inputRow.classList.contains(hideClass) &&
      inputRow.classList.add(hideClass);
    inputRow.value = "";
  };

  useEffect(() => {
    fetchApiLoadMainData();
  }, []);

  return (
    <div className="configData">
      <div className="configData__header">
        <div className="configData__title">Config data</div>
      </div>
      <div className="configData__content">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Note</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className={renderClassShowMainData()}>{renderTable()}</tbody>
          <tbody className={renderClassSpinTable()}>
            <tr>
              <td colSpan={3}>
                <div className="spin-container">
                  <Spin />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ConfigData;
