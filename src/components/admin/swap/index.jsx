import React, { useEffect, useState, useRef, useCallback } from "react";
import css from "./swap.module.scss";
import { Pagination, Spin } from "antd";
import { Input } from "src/components/Common/Input";
import { adminPermision, api_status, image_domain } from "src/constant";
import socket from "src/util/socket";
import { EmptyCustom } from "src/components/Common/Empty";
import { historySwapAdmin } from "src/util/adminCallApi";
import { analysisAdminPermision, debounce, formatNumber, rountRange } from "src/util/common";
import { availableLanguage, availableLanguageCodeMapper } from "src/translation/i18n";
import Dropdown from "src/components/Common/dropdown/Dropdown";
import { DOMAIN } from "src/util/service";
import { adminFunction } from "../sidebar";
import { useSelector } from "react-redux";
import { getAdminPermision } from "src/redux/reducers/admin-permision.slice";
import NoPermision from "../no-permision";

export default function SwapAdmin() {
  const all = "ALL";
  const coinDropdownAllItem = { id: 'all', name: all }
  const filterType = {
    coin: "coin",
    username: "username",
  };


  // phần kiểm tra quyền của admin
  const { permision } = useSelector(getAdminPermision);
  const currentPagePermision = analysisAdminPermision(adminFunction.swap, permision);



  // phần phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItem, setTotalItem] = useState(1);
  const limit = useRef(10);
  const pageChangeHandle = function (page) {
    fetchHistorySwapAdmin(page, seletedCoin.content, userName, filter);
  };



  // phần filter 
  const [filter, setFilter] = useState(filterType.coin);
  const filterUserName = () => {
    setFilter(filterType.username);
    setSeletedCoin({ id: 'all', content: all });
  }
  const filterCoin = () => {
    setFilter(filterType.coin);
    setUserName('');
  }




  // input username
  const [userName, setUserName] = useState();
  const inputUserNameChangeHandle = function (ev) {
    const value = ev.target.value;
    setUserName(() => value);
    filterUserName();
    fetchHistorySwapAdminDebounced(1, undefined, value, filterType.username);
  };



  // phần list coin
  const [fetchListCoinStatus, setFetchListCoinStatus] = useState(api_status.pending);
  const [listCoin, setListCoin] = useState([]);
  const [seletedCoin, setSeletedCoin] = useState(all);
  const fetchListCoin = function () {
    if (fetchListCoinStatus === api_status.fetching) return;
    setFetchListCoinStatus(() => api_status.fetching);
    try {
      socket.once("listCoin", (resp) => {
        setFetchListCoinStatus(() => api_status.fulfilled);
        const result = [coinDropdownAllItem, ...resp];
        setListCoin(result);
        setSeletedCoin({ id: 'all', content: all })
      });
    } catch (error) {
      setFetchListCoinStatus(() => api_status.rejected);
    }
  };
  const coinClickHandle = function (coinName) {
    setSeletedCoin(coinName);
    filterCoin();
    fetchHistorySwapAdmin(1, coinName.content, undefined, filterType.coin);
  };
  const genListCoinObject = () => {
    const result = [];
    listCoin?.map(coin => {
      if (coin.image) {
        result.push({
          id: coin.id,
          image: DOMAIN + coin.image,
          content: coin.name
        })
      } else {
        result.push({
          id: coin.id,
          content: coin.name
        })
      }
    })
    return result;
  }



  // phần main data
  const [dataTable, setDataTable] = useState([]);
  const [fetchDataTableStatus, setFetchDataTableStatus] = useState(api_status.pending);
  const fetchHistorySwapAdmin = async function (
    page = 1,
    coinName = all,
    username = "",
    fillter = filterType.coin
  ) {
    try {
      if (fetchDataTableStatus === api_status.fetching) return;
      setFetchDataTableStatus(() => api_status.fetching);
      const params = processParams(page, coinName, username, fillter);
      const resp = await historySwapAdmin(params);
      const { array, total } = resp.data.data;
      setDataTable(() => array);
      setTotalItem(() => total);
      setCurrentPage(() => page);
      setFetchDataTableStatus(() => api_status.fulfilled);
    } catch (error) {
      setFetchDataTableStatus(() => api_status.rejected);
    }
  };
  const processParams = function (page, coinName, username, filter) {
    const result = {
      limit: limit.current,
      page: page,
    };

    if (filter === filterType.coin) {
      if (coinName !== all)
        result.query = `wallet = '${coinName}' OR coin_key='${coinName}'`;
    } else if (filter === filterType.username)
      result.query = `POSITION('${username}' IN userName) OR POSITION('${username}' IN email)`;

    return result;
  };




  // phần render table
  const renderTable = function (table) {
    if (!table || table.length <= 0) return;
    return table.map((item) => (
      <tr key={item.id}>
        <td>
          <div className="d-flex alignItem-c gap-1">
            <img style={{ width: 20, height: 20, objectFit: 'cover' }} src={image_domain.replace('USDT', item.wallet)} alt={item.wallet} />
            {item.wallet}
          </div>
        </td>
        <td>
          <div className="d-flex alignItem-c gap-1">
            <img style={{ width: 20, height: 20, objectFit: 'cover' }} src={image_domain.replace('USDT', item.coin_key)} alt={item.coin_key} />
            {item.coin_key}
          </div>
        </td>
        <td>
          <div className="d-flex alignItem-c gap-1">
            <img style={{ width: 20, height: 20, objectFit: 'cover' }} src={image_domain.replace('USDT', item.coin_key)} alt={item.coin_key} />
            {formatNumber(item.amount, availableLanguage.en, rountRange(
              listCoin?.find((coin) => coin?.name === item?.coin_key.toUpperCase())
                ?.price || 10000
            ))}
          </div>
        </td>
        <td>{item.created_at}</td>
        <td>{item.userName}</td>
        <td>{item.email}</td>
        <td>
          <div className="d-flex alignItem-c gap-1">
            <img style={{ width: 20, height: 20, objectFit: 'cover' }} src={image_domain.replace('USDT', item.wallet)} alt={item.wallet} />
            {formatNumber(item.wallet_amount, availableLanguage.en, rountRange(
              listCoin?.find((coin) => coin?.name === item?.wallet.toUpperCase())
                ?.price || 10000
            ))}
          </div>
        </td>
      </tr>
    ));
  };
  const renderTableSpin = function () {
    return fetchDataTableStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderTableEmpty = function () {
    return fetchDataTableStatus !== api_status.fetching &&
      (!dataTable || dataTable.length <= 0)
      ? ""
      : "--d-none";
  };
  const renderTableContent = function () {
    return fetchDataTableStatus !== api_status.fetching &&
      dataTable &&
      dataTable.length > 0
      ? ""
      : "--d-none";
  };




  // debouce
  const fetchHistorySwapAdminDebounced = useCallback(
    debounce(fetchHistorySwapAdmin, 1000),
    []
  );



  //useEffect
  useEffect(() => {
    fetchListCoin()
    fetchHistorySwapAdmin()
  }, []);




  if (currentPagePermision === adminPermision.noPermision) {
    return (
      <NoPermision />
    )
  }






  return (
    <div className={css["swapAdmin"]}>
      <div className={css["swapAdmin__header"]}>
        <div className={css["swapAdmin__title"]}>Swap</div>
        <div className={`row ${css["swapAdmin__filter"]}`}>
          <div className={`col-md-12 col-7 pl-0 row`}>
            <Dropdown
              list={genListCoinObject()}
              itemClickHandle={coinClickHandle}
              itemSelected={seletedCoin}
              id={`coinDropdown`}
            />
            <div className="mt-2 w-100">
              <Input
                value={userName}
                onChange={inputUserNameChangeHandle}
                placeholder={"UserName"}
              />
            </div>
          </div>
          <div className={`col-md-12 col-5 ${css["swapAdmin__paging"]}`}>
            <Pagination
              showSizeChanger={false}
              current={currentPage}
              onChange={pageChangeHandle}
              total={totalItem}
            />
          </div>
        </div>
      </div>
      <div className={css["swapAdmin__content"]}>
        <table>
          <thead>
            <tr>
              <th>Wallet</th>
              <th>Coin_key</th>
              <th>Amount</th>
              <th>created_at</th>
              <th>userName</th>
              <th>email</th>
              <th>wallet_amount</th>
            </tr>
          </thead>
          <tbody className={renderTableContent()}>
            {renderTable(dataTable)}
          </tbody>
          <tbody className={renderTableSpin()}>
            <tr>
              <td colSpan={7}>
                <div className="spin-container">
                  <Spin />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody className={renderTableEmpty()}>
            <tr>
              <td colSpan={7}>
                <div>
                  <EmptyCustom></EmptyCustom>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
