import { Pagination, Spin } from "antd";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { EmptyCustom } from "src/components/Common/Empty";
import css from "./transferAdmin.module.scss";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { adminPermision, api_status, image_domain, url, urlParams } from "src/constant";
import socket from "src/util/socket.js";
import {
  historytransferAdmin,
  historytransferAdminAll,
} from "src/util/adminCallApi.js";
import {
  analysisAdminPermision,
  debounce,
  exportExcel,
  formatNumber,
  rountRange,
  shortenHash,
} from "src/util/common.js";
import { availableLanguage } from "src/translation/i18n.js";
import { Input } from "src/components/Common/Input";
import Dropdown from "src/components/Common/dropdown/Dropdown";
import { DOMAIN } from "src/util/service";
import CopyButton from "src/components/Common/copy-button";
import { NavLink } from "react-router-dom";
import { adminFunction } from "../sidebar";
import { getAdminPermision } from "src/redux/reducers/admin-permision.slice";
import { useSelector } from "react-redux";
import NoPermision from "../no-permision";

export default function TransferAdmin() {
  const all = "ALL";
  const allDropdownItem = { id: 'all', content: 'ALL' }
  const filterType = {
    coin: "coin",
    username: "username",
    id: 'id'
  };




  // phần kiểm tra quyền của admin
  const { permision } = useSelector(getAdminPermision);
  const currentPagePermision = analysisAdminPermision(adminFunction.transfer, permision);



  //filter
  const filter = useRef(filterType.coin);
  const filterByCoin = () => {
    filter.current = filterType.coin;
    setUserName('');
    setUserId('');
  }
  const filterByUsername = () => {
    filter.current = filterType.username;
    setUserId('');
    setSeletedCoin(allDropdownItem);
  }
  const filterByIdUser = () => {
    filter.current = filterType.idUser;
    setSeletedCoin(allDropdownItem);
    setUserName('');
  }

  //paging
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItem, setTotalItem] = useState(1);
  const pageChangeHandle = function (page) {
    fetchApiLoadData(page, seletedCoin.content, userName, filter.current, userId);
  };

  //dropdown list coin
  const [listCoin, setListCoin] = useState([]);
  const [seletedCoin, setSeletedCoin] = useState();
  const genListCoinObj = () => {
    const result = [];

    listCoin?.map(item => {
      if (item.image) {
        result.push({
          id: item.id,
          image: DOMAIN + item.image,
          content: item.name
        })
      } else {
        result.push({
          id: item.id,
          content: item.name
        })
      }
    })

    return result
  }
  const getListCoin = function () {
    return new Promise((resolve, reject) => {
      socket.once("listCoin", (resp) => {
        resolve(resp);
        const result = [{ id: 'all', name: all }, ...resp];
        setListCoin(result);
        setSeletedCoin(allDropdownItem);
      });
    });
  };
  const coinDropdownItemClickHandle = (item) => {
    setSeletedCoin(item);
    filterByCoin();
    fetchApiLoadData(1, item.content, userName, filter.current, userId);
  }

  // inpupt username
  const [userName, setUserName] = useState("");
  const inputUserNameChangeHandle = function (e) {
    const stringValue = e.target.value;
    setUserName(stringValue);
    filterByUsername();
    fetchApiLoadDataDebounced(1, seletedCoin, stringValue, filterType.username);
  };

  // input user id
  const [userId, setUserId] = useState('');
  const userIdChangeHandle = function (ev) {
    const stringValue = ev.target.value;
    setUserId(stringValue);
    filterByIdUser();
    fetchApiLoadDataDebounced(1, seletedCoin, userName, filterType.id, stringValue);
  }


  // load data
  const [callApiMainApiStatus, setCallApiMainApiStatus] = useState(
    api_status.pending
  );
  const fetchApiLoadData = function (
    page = 1,
    symbol = all,
    username = "",
    filter = filterType.coin,
    id = ""
  ) {
    if (callApiMainApiStatus === api_status.fetching) return;
    setCallApiMainApiStatus(() => api_status.fetching);
    return new Promise((resolve, reject) => {
      const obj = processQuery({ page, filter, symbol, username, id });
      historytransferAdmin(obj)
        .then((resp) => {
          const { array, total } = resp.data.data;
          setListTransfer(() => array);
          setTotalItem(() => total);
          setCurrentPage(() => page);
          setCallApiMainApiStatus(() => api_status.fulfilled);
          resolve({ array, total });
        })
        .catch((error) => {
          setCallApiMainApiStatus(() => api_status.reject);
        });
    });
  };
  const processQuery = function ({ page, filter, symbol, username, id }) {

    const result = {
      limit: 10,
      page,
    };

    switch (filter) {
      case filterType.coin:
        if (symbol !== all)
          return {
            ...result,
            query: `coin_key = '${symbol}'`,
          };
        break;

      case filterType.username:
        return {
          ...result,
          query: `POSITION('${username}' IN address_form) OR POSITION('${username}' IN address_to)`,
        };

      case filterType.id:
        return {
          ...result,
          query: `user_id=${id} OR receive_id=${id}`
        }

      default:
        break;
    }
    return result;
  };


  // excell
  const [callApiExportExcelStatus, setCallApiExportExcelStatus] = useState(
    api_status.pending
  );
  const [listTransfer, setListTransfer] = useState([]);
  const exportExcelHandle = async function () {
    try {
      if (callApiExportExcelStatus === api_status.fetching) {
        return;
      }
      setCallApiExportExcelStatus(api_status.fetching);
      const resp = await historytransferAdminAll();
      exportExcel(resp.data.data, "Transfer", "Transfer");
      setCallApiExportExcelStatus(api_status.fulfilled);
    } catch (error) {
      setCallApiExportExcelStatus(api_status.reject);
    }
  };



  // function cho table
  const renderTable = function (listTransfer) {
    if (
      !listTransfer ||
      listTransfer.length <= 0 ||
      !listCoin ||
      listCoin.length <= 0
    )
      return;
    return listTransfer.map((item) => (
      <tr key={item.id}>
        <td>
          <div className="d-flex alignItem-c gap-1">
            <img style={{ width: 20, height: 20, objectFit: "cover" }} src={image_domain.replace("USDT", item.coin_key.toUpperCase())} alt={item.coin_key} />
            {formatNumber(
              item.amount,
              availableLanguage.en,
              rountRange(
                listCoin.find((coin) => coin.name === item.coin_key.toUpperCase())
                  ?.price || 10000
              )
            )}
          </div>
        </td>
        <td>
          <div className="d-flex alignItem-c gap-1">
            <NavLink className={`--link`} to={url.admin_userDetail.replace(urlParams.userId, item.user_id)}>
              {shortenHash(item.address_form)}
            </NavLink>
            <CopyButton value={item.address_form} />
          </div>
        </td>
        <td>
          <div className="d-flex alignItem-c gap-1">
            <img style={{ width: 20, height: 20, objectFit: "cover" }} src={image_domain.replace("USDT", item.coin_key.toUpperCase())} alt={item.coin_key} />
            {formatNumber(item?.amountBeforeFrom, availableLanguage.en, rountRange(
              listCoin.find((coin) => coin.name === item.coin_key.toUpperCase())
                ?.price || 10000
            ))}
          </div>
        </td>
        <td>
          <div className="d-flex alignItem-c gap-1">
            <img style={{ width: 20, height: 20, objectFit: "cover" }} src={image_domain.replace("USDT", item.coin_key.toUpperCase())} alt={item.coin_key} />
            {formatNumber(item?.amountAfterFrom, availableLanguage.en, rountRange(
              listCoin.find((coin) => coin.name === item.coin_key.toUpperCase())
                ?.price || 10000
            ))}
          </div>
        </td>
        <td>
          <div className="d-flex alignItem-c gap-1">
            <NavLink className={`--link`} to={url.admin_userDetail.replace(urlParams.userId, item.receive_id)}>
              {shortenHash(item.address_to)}
            </NavLink>
            <CopyButton value={item.address_to} />
          </div>
        </td>
        <td>
          <div className="d-flex alignItem-c gap-1">
            <img style={{ width: 20, height: 20, objectFit: "cover" }} src={image_domain.replace("USDT", item.coin_key.toUpperCase())} alt={item.coin_key} />
            {formatNumber(item?.amountBeforeTo, availableLanguage.en, rountRange(
              listCoin.find((coin) => coin.name === item.coin_key.toUpperCase())
                ?.price || 10000
            ))}
          </div>
        </td>
        <td>
          <div className="d-flex alignItem-c gap-1">
            <img style={{ width: 20, height: 20, objectFit: "cover" }} src={image_domain.replace("USDT", item.coin_key.toUpperCase())} alt={item.coin_key} />
            {formatNumber(item?.amountAfterTo, availableLanguage.en, rountRange(
              listCoin.find((coin) => coin.name === item.coin_key.toUpperCase())
                ?.price || 10000
            ))}
          </div>
        </td>
        <td>{item.created_at}</td>
        <td>{item.note}</td>
      </tr>
    ));
  };
  const renderClassSpinComponent = function () {
    return callApiMainApiStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassEmptyComponent = function () {
    return callApiMainApiStatus !== api_status.fetching &&
      listTransfer &&
      listTransfer.length <= 0
      ? ""
      : "--d-none";
  };
  const renderClassDataTable = function () {
    return callApiMainApiStatus !== api_status.fetching &&
      listTransfer &&
      listTransfer.length > 0
      ? ""
      : "--d-none";
  };


  // debouce cho fetch main data
  const fetchApiLoadDataDebounced = useCallback(
    debounce(fetchApiLoadData, 1000),
    []
  );

  // useEffect 
  useEffect(() => {
    getListCoin();
    fetchApiLoadData();
  }, []);




  if (currentPagePermision === adminPermision.noPermision) {
    return (
      <NoPermision />
    )
  }





  return (
    <div className={css["transferAdmin"]}>
      <div className={css["transferAdmin__header"]}>
        <div className={css["transferAdmin__title"]}>Transfer</div>
        <div className={`row ${css["transferAdmin__filter"]}`}>
          <div className={`col-md-12 col-7 pl-0 row`}>
            <div
              className={`row ${css["transferAdmin__list-coin"]
                }`}
            >
              <Dropdown
                id={`dropdownListCoin`}
                list={genListCoinObj()}
                itemClickHandle={coinDropdownItemClickHandle}
                itemSelected={seletedCoin}
              />
            </div>
            <div
              className={`col-12 row p-0 alignItem-c`}
            >
              <div className="col-12 px-0">
                <Input
                  value={userName}
                  onChange={inputUserNameChangeHandle}
                  placeholder={"UserName"}
                />
              </div>
            </div>
            <div
              className={`col-12 row p-0 alignItem-c`}
            >
              <div className="col-12 px-0 pt-0">
                <Input
                  value={userId}
                  onChange={userIdChangeHandle}
                  placeholder={"User Id"}
                />
              </div>
            </div>
          </div>
          <div className={`col-md-12 col-5 ${css["transferAdmin__paging"]}`}>
            <Pagination
              showSizeChanger={false}
              current={currentPage}
              onChange={pageChangeHandle}
              total={totalItem}
            />
          </div>
          <div className={`row p-0 mb-3`}>
            <Button
              loading={callApiExportExcelStatus === api_status.fetching}
              onClick={exportExcelHandle}
            >
              <i className="fa-solid fa-download"></i>
              Export Excel
            </Button>
          </div>
        </div>
      </div>
      <div className={css["transferAdmin__content"]}>
        <table>
          <thead>
            <tr>
              <th>Amount</th>
              <th>Address From</th>
              <th>Amount Before From</th>
              <th>Amount After From</th>
              <th>Address To</th>
              <th>Amount Before To</th>
              <th>Amount After To</th>
              <th>Create At</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody className={renderClassDataTable()}>
            {renderTable(listTransfer)}
          </tbody>
          <tbody className={renderClassSpinComponent()}>
            <tr>
              <td colSpan={9}>
                <div className="spin-container">
                  <Spin />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody className={renderClassEmptyComponent()}>
            <tr>
              <td colSpan={9}>
                <div className="spin-container">
                  <EmptyCustom />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
