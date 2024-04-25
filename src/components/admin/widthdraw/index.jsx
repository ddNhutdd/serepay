import React, { useEffect, useState, useRef, useCallback } from "react";
import { Pagination, Spin } from "antd";
import { EmptyCustom } from "src/components/Common/Empty";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { api_status } from "src/constant";
import {
  activeWidthdraw,
  cancelWidthdraw,
  getListWidthdrawCoin,
  getListWidthdrawCoinAll,
  getListWidthdrawCoinPendding,
  searchWalletToWithdraw,
} from "src/util/adminCallApi";
import socket from "src/util/socket";
import { ModalConfirm } from "src/components/Common/ModalConfirm";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { Input } from "src/components/Common/Input";
import { TagCustom, TagType } from "src/components/Common/Tag";
import { debounce } from "src/util/common";
import Dropdown from "src/components/Common/dropdown/Dropdown";
import { DOMAIN } from "src/util/service";

function Widthdraw() {


  // const
  const all = 'ALL';
  const allDropdownItem = { id: 'all', content: all }
  const filterType = {
    all: 'all',
    coin: 'coin',
    coinPending: 'coinPending',
    address: 'address',
    userId: 'userId'
  };


  // bộ lọc
  const filter = useRef(filterType.all);
  const allFilter = () => {
    filter.current = filterType.all;
    setInputSearchAddressValue('');
    setUserIdSearchValue('');
    setIsChecked(false);
  }
  const coinFilter = () => {
    filter.current = filterType.coin;
    setInputSearchAddressValue('');
    setUserIdSearchValue('');
    setIsChecked(false);
  }
  const coinPendingFilter = () => {
    filter.current = filterType.coinPending;
  }
  const userIdFilter = () => {
    filter.current = filterType.userId;
  }


  // phân trang
  const [totalItems, setTotalItems] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = useRef(10);
  const pageChangeHandle = function (page) {
    loadData(filter.current, page, selectedCoin.content, inputSearchAddressValue, userIdSearchValue)
  };


  // dropdown list coin
  const [listCoin, setListCoin] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const fetchAllCoin = function () {
    socket.once("listCoin", (resp) => {
      const result = [{ id: 'all', name: all }, ...resp];
      setSelectedCoin(allDropdownItem)
      setListCoin(result);
    });
  };
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

    return result;
  }
  const coinClickHandle = (coin) => {
    setSelectedCoin(coin);
    coinFilter();
    loadData(filter.current, 1, coin.content, '');
  }


  // input address
  const [inputSearchAddressValue, setInputSearchAddressValue] = useState('');
  const inputSearchChangeHandle = (ev) => {
    setInputSearchAddressValue(ev.target.value);
  }


  // input userid
  const [userIdSearchValue, setUserIdSearchValue] = useState('');
  const userIdSearchValueChange = (ev) => {
    setUserIdSearchValue(ev.target.value);
  }


  // checkbox pending
  const [isChecked, setIsChecked] = useState(false);
  const pendingChangeHandle = function (e) {
    const isCheckedLc = e.target.checked;
    if (
      callApiLoadMainDataStatus === api_status.fetching
    ) {
      e.target.checked = !isCheckedLc;
      return;
    }
    isChecked.current = isCheckedLc;
    if (isCheckedLc) {
      fetchApiLoadDataByCoinPending(1, selectedCoin);
    } else {
      fetchApiLoadDataByCoin(1, selectedCoin);
    }
  };
  const showPending = !selectedCoin || selectedCoin.content === all ? '--d-none' : '';


  // tải dữ liệu
  const [callApiLoadMainDataStatus, setCallApiLoadMainDataStatus] = useState(api_status.pending);
  const [mainData, setMainData] = useState([]);
  const loadData = function (filter, page, coinName, address, userId) {
    switch (filter) {
      case filterType.all:
        fetchApiLoadDataAll(page);
        break;


      case filterType.coin:
        if (coinName === all) {
          fetchApiLoadDataAll(page);
        } else if (coinName !== all) {
          fetchApiLoadDataByCoin(page, coinName);
        }
        break;


      case filterType.coinPending:
        fetchApiLoadDataByCoinPending(page, coinName);
        break;


      case filterType.address:
        fetchSearchTransferByAddress(page, address);
        break;


      case filterType.userId:
        fetchApiLoadDataBuyUserId(page, userId);
        break;


      default:
        break;
    }
  };
  const clearMainData = function () {
    setMainData(() => []);
    setCurrentPage(() => 1);
    setTotalItems(() => 1);
  };
  const fetchApiLoadDataAll = function (page) {
    return new Promise((resolve, reject) => {
      if (callApiLoadMainDataStatus === api_status.fetching) resolve([]);
      else setCallApiLoadMainDataStatus(api_status.fetching);
      clearMainData();
      getListWidthdrawCoinAll({
        limit: limit.current,
        page,
      })
        .then((resp) => {
          setCallApiLoadMainDataStatus(() => api_status.fulfilled);
          const data = resp.data.data;
          setMainData(() => data.array);
          setTotalItems(() => data.total);
          resolve(data.array);
        })
        .catch(() => {
          setCallApiLoadMainDataStatus(() => api_status.rejected);
          setTotalItems(1);
          reject(false);
        })
        .finally(() => {
          setCurrentPage(() => page);
        });
    });
  };
  const fetchApiLoadDataByCoin = function (page, symbol) {
    return new Promise((resolve, reject) => {
      if (callApiLoadMainDataStatus === api_status.fetching) resolve([]);
      else {
        setCallApiLoadMainDataStatus(() => api_status.fetching);
        clearMainData();
      }
      getListWidthdrawCoin({
        limit: limit.current,
        page,
        symbol,
      })
        .then((resp) => {
          const data = resp.data.data;
          setMainData(() => data.array);
          setCallApiLoadMainDataStatus(() => api_status.fulfilled);
          setTotalItems(() => data.total);
          setCurrentPage(() => page);
          resolve(data.array);
        })
        .catch(() => {
          setCallApiLoadMainDataStatus(() => api_status.rejected);
          reject(() => false);
        });
    });
  };
  const fetchApiLoadDataByCoinPending = function (page, symbol) {
    return new Promise((resolve, reject) => {
      if (callApiLoadMainDataStatus === api_status.fetching) resolve(false);
      else {
        setCallApiLoadMainDataStatus(() => api_status.fetching);
        clearMainData();
      }
      getListWidthdrawCoinPendding({
        limit: limit.current,
        page,
        symbol,
      })
        .then((resp) => {
          const data = resp.data.data;
          setTotalItems(() => data.total);
          setCallApiLoadMainDataStatus(() => api_status.fulfilled);
          setCurrentPage(() => page);
          setMainData(() => data.array);
          resolve(data.array);
        })
        .catch(() => {
          setCallApiLoadMainDataStatus(() => api_status.rejected);
          reject(false);
        });
    });
  };
  const fetchSearchTransferByAddress = async (limit, page, keyword) => {
    try {
      if (callApiLoadMainDataStatus === api_status.fetching) return;
      setCallApiLoadMainDataStatus(api_status.fetching);
      clearMainData();
      const resp = await searchWalletToWithdraw(
        {
          limit,
          page,
          keyWork: keyword
        }
      )
      const data = resp?.data?.data;
      setMainData(data?.array);
      setCurrentPage(page);
      setTotalItems(data.total);

      setCallApiLoadMainDataStatus(api_status.fulfilled);
    } catch (error) {
      setCallApiLoadMainDataStatus(api_status.rejected);
    }
  }
  const fetchApiLoadDataBuyUserId = async function (page, userId) {
    try {
      if (callApiLoadMainDataStatus === api_status.fetching) {
        return;
      }
      setCallApiLoadMainDataStatus(api_status.fetching);

      const resp = await getWalletToWithdrawWhere({
        limit: limit.current,
        page,
        where: `user_id=${userId} OR from_id=${userId}`
      });
      console.log(resp);

      setCallApiLoadMainDataStatus(api_status.fulfilled);
    } catch (error) {
      console.log(error);
      setCallApiLoadMainDataStatus(api_status.rejected);
    }
  }


  // modal confirm 
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
  const [callApiAcceptStatus, setCallApiAcceptStatus] = useState(api_status.pending);
  const showModalConfirm = function (id) {
    selectedWidthdraw.current = id;
    setIsShowModalConfirm(() => true);
  };
  const closeModalConfirm = function () {
    if (callApiAcceptStatus === api_status.fetching) return;
    setIsShowModalConfirm(() => false);
  };
  const fetchApiActiveWidthdraw = function (id) {
    return new Promise((resolve, reject) => {
      if (callApiAcceptStatus === api_status.fetching) resolve(false);
      else setCallApiAcceptStatus(() => api_status.fetching);
      activeWidthdraw({
        id,
      })
        .then(() => {
          callToastSuccess("Success");
          setCallApiAcceptStatus(() => api_status.fulfilled);
          closeModalConfirm();
          loadData(currentPage, selectedCoin);
        })
        .catch(() => {
          callToastError("Fail");
          setCallApiAcceptStatus(() => api_status.rejected);
          reject(false);
        });
    });
  };


  // modal reject
  const [isShowModalReject, setIsShowModalReject] = useState(false);
  const [callApiRejectStatus, setCallApiRejectStatus] = useState(api_status.pending);
  const inputReasonElement = useRef();
  const closeModalReject = function () {
    setIsShowModalReject(() => false);
  };
  const showModalReject = function (id) {
    selectedWidthdraw.current = id;
    setIsShowModalReject(() => true);
  };
  const fetchApiReject = function (id, note) {
    return new Promise((resolve, reject) => {
      if (callApiRejectStatus === api_status.fetching) resolve(false);
      else setCallApiRejectStatus(() => api_status.fetching);
      cancelWidthdraw({
        id,
        note,
      })
        .then(() => {
          callToastSuccess("Success");
          setCallApiRejectStatus(() => api_status.fulfilled);
          closeModalReject();
          loadData(currentPage, selectedCoin);
          inputReasonElement.current.value = "";
          resolve(true);
        })
        .catch(() => {
          setCallApiRejectStatus(() => api_status.rejected);

          callToastError("Fail");
          reject(false);
        });
    });
  };
  const renderContentModalReject = function () {
    return (
      <div className="modalRejectControl">
        <label className="modalRejectLabel" htmlFor="widthdrawReason">
          Reason
        </label>
        <Input
          ref={inputReasonElement}
          className="modalRejectInput"
          id="widthdrawReason"
        />
      </div>
    );
  };
  const buttonOKModalRejectClickHandle = function () {
    const note = inputReasonElement.current.value;
    fetchApiReject(selectedWidthdraw.current, note);
  };


  // render table 
  const renderClassSpin = function () {
    return callApiLoadMainDataStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassEmpty = function () {
    if (
      callApiLoadMainDataStatus !== api_status.fetching &&
      (!mainData || mainData.length <= 0)
    )
      return "";
    else return "--d-none";
  };
  const renderStatus = function (status) {
    switch (status) {
      case 0:
        return <TagCustom type={TagType.error} />;
      case 1:
        return <TagCustom type={TagType.success} />;
      case 2:
        return <TagCustom type={TagType.pending} />;
      default:
        return null;
    }
  };
  const renderDataTable = function () {
    return mainData.map((record) => (
      <tr key={record.id}>
        <td>{record.coin_key.toUpperCase()}</td>
        <td>{record.amount}</td>
        <td>
          <div style={{ wordBreak: 'break-all' }}>
            {record.to_address}
          </div>
        </td>
        <td>
          <div style={{ wordBreak: 'break-all' }}>
            {record.form_address}
          </div>
        </td>
        <td>
          <div style={{ wordBreak: "break-all" }}>
            {record.hash}
          </div>
        </td>
        <td>{record.created_at}</td>
        <td>{record.note}</td>
        <td>{record.username}</td>
        <td>{record.email}</td>
        <td>{record.phone}</td>
        <td>{record.amount_pay_by_coin}</td>
        <td>{record.fee_amount}</td>
        <td>{renderStatus(record.status)}</td>
        <td>{renderAction(record.id, record.status)}</td>
      </tr>
    ));
  };
  const renderAction = function (id, status) {
    if (status === 2) {
      return (
        <div className="widthdraw__action">
          <Button
            onClick={showModalConfirm.bind(null, id)}
            children={"Confirm"}
          />
          <Button
            onClick={showModalReject.bind(null, id)}
            children={"Reject"}
          />
        </div>
      );
    }
  };


  // useEffect
  useEffect(() => {
    fetchApiLoadDataAll(1);
    fetchAllCoin();
  }, []);


  const selectedWidthdraw = useRef();
  const fetchSearchTransferByAddressDebouced = useCallback(debounce(fetchSearchTransferByAddress, 1000), []);


  return (
    <div className="widthdraw">
      <div className="widthdraw__header">
        <div className="widthdraw__title">Widthdraw</div>
        <div className="row widthdraw__filter">
          <div className="col-md-12 col-7 pl-0">
            <div className={`row widthdraw__list-coin`}>
              <div className="w-100">
                <div>
                  <Dropdown
                    id={`coinDropdown`}
                    list={genListCoinObj()}
                    itemSelected={selectedCoin}
                    itemClickHandle={coinClickHandle}
                  />
                </div>
                <div className={`widthdraw__pending mt-3 ${showPending}`}>
                  <input
                    onChange={pendingChangeHandle}
                    className="--d-none"
                    type="checkbox"
                    id="widthdrawPending"
                    checked={isChecked}
                  />
                  <label
                    className="row widthdraw__pending-content"
                    htmlFor="widthdrawPending"
                  >
                    <div className="widthdraw__pending-square">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <div>Pending</div>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Input
                value={inputSearchAddressValue}
                onChange={inputSearchChangeHandle}
                placeholder={`Input a Address`}
              />
            </div>
            <div className="mt-3">
              <Input
                value={userIdSearchValue}
                onChange={userIdSearchValueChange}
                placeholder={`User Id`}
              />
            </div>
          </div>
          <div className="col-md-12 col-5 widthdraw__paging">
            <Pagination
              showSizeChanger={false}
              current={currentPage}
              onChange={pageChangeHandle}
              total={totalItems}
            />
          </div>
        </div>
      </div>
      <div className="widthdraw__content">
        <table>
          <thead>
            <tr>
              <th>Coin Key</th>
              <th>Amount</th>
              <th>To Address</th>
              <th>From Address</th>
              <th>Hash</th>
              <th>Time</th>
              <th>Note</th>
              <th>UserName</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Amount Pay By Coin</th>
              <th>Fee Amount</th>
              <th>Status</th>
              <th>
                <i className="fa-solid fa-gears"></i>
              </th>
            </tr>
          </thead>
          <tbody>{renderDataTable()}</tbody>
        </table>
        <div className={renderClassEmpty()}>
          <EmptyCustom />
        </div>
        <div className={renderClassSpin() + " spin-container"}>
          <Spin />
        </div>
      </div>
      <ModalConfirm
        isShowModal={isShowModalConfirm}
        modalConfirmHandle={fetchApiActiveWidthdraw.bind(
          null,
          selectedWidthdraw.current
        )}
        closeModalHandle={closeModalConfirm}
        waiting={callApiAcceptStatus}
      />
      <ModalConfirm
        content={renderContentModalReject()}
        isShowModal={isShowModalReject}
        modalConfirmHandle={buttonOKModalRejectClickHandle}
        closeModalHandle={closeModalReject}
        waiting={callApiRejectStatus}
      />
    </div>
  );
}

export default Widthdraw;
