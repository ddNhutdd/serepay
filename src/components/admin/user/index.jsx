import { Pagination, Spin } from "antd";
import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom/cjs/react-router-dom.min";
import { Button } from "src/components/Common/Button";
import { EmptyCustom } from "src/components/Common/Empty";
import { Input } from "src/components/Common/Input";
import Switch from "src/components/Common/switch";
import { adminPermision, api_status, commontString, url, urlParams } from "src/constant";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import {
  activeuser,
  getAllUser,
  getUserAllExcel,
  searchUserFromUserName,
  turn2fa,
  typeAds,
} from "src/util/adminCallApi";
import { analysisAdminPermision, debounce, exportExcel } from "src/util/common";
import socket from "src/util/socket";
import CoinCells from "./coin-cell";
import { TagCustom, TagType } from "src/components/Common/Tag";
import { useSelector } from "react-redux";
import { getAdminPermision } from "src/redux/reducers/admin-permision.slice";
import { adminFunction } from "../sidebar";
import NoPermision from "../no-permision";

const User = function () {


  // phần kiểm tra quyền của admin
  const { permision } = useSelector(getAdminPermision);
  const currentPagePermision = analysisAdminPermision(adminFunction.user, permision);









  // phần phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItem, setTotalItem] = useState(1);
  const limit = useRef(10);
  const pageChangeHandle = function (page) {
    loadData(page);
  };



  // disable switch
  const loadingSwitch = (id, setState, loading) => {
    setState(prevState => {
      const newState = [...prevState];
      const findedItem = newState.find(item => item.id === id);
      findedItem.loading = loading;
      return newState;
    })
  }



  // phần ads
  const [adsValueList, setAdsValueList] = useState([]);
  const onAdsCLickHandle = async function (id) {
    loadingSwitch(id, setAdsValueList, true)
    await fetchApiTypeAds(id, 1);
    loadingSwitch(id, setAdsValueList, false)
  };
  const offAdsClickHandle = async function (id) {
    loadingSwitch(id, setAdsValueList, true);
    await fetchApiTypeAds(id, 0);
    loadingSwitch(id, setAdsValueList, false);
  };
  const fetchApiTypeAds = function (id, type) {
    return new Promise((resolve, reject) => {
      typeAds({
        id,
        type,
      })
        .then((resp) => {
          setCallApiMainDataStatus(() => api_status.fulfilled);
          callToastSuccess(commontString.success);
          resolve(true);
          // nếu call api thành công thì udpate state
          setAdsValueList(prevState => {
            const newState = [...prevState];
            for (const item of newState) {
              if (item.id === id) {
                item.type_ads = type;
                break;
              }
            }
            return newState;
          })
        })
        .catch((error) => {
          setCallApiMainDataStatus(() => api_status.rejected);
          callToastError(commontString.error);
          reject(`false`);
        });
    });
  };



  // phần 2fa
  const [twofaValueList, setTwofaValueList] = useState([]);
  const turnOn2FAClickHandle = async function (userid) {
    loadingSwitch(userid, setTwofaValueList, true)
    await fetchApiTurn2FA(userid, 1);
    loadingSwitch(userid, setTwofaValueList, false)
  };
  const turnOff2FAClickHandle = async function (userid) {
    loadingSwitch(userid, setTwofaValueList, true)
    await fetchApiTurn2FA(userid, 0);
    loadingSwitch(userid, setTwofaValueList, false)
  };
  const fetchApiTurn2FA = function (userid, flag) {
    return new Promise((resolve, reject) => {
      turn2fa({
        userid,
        flag,
      })
        .then((resp) => {
          callToastSuccess(commontString.success);
          // nếu call api thành công thì set lại state twofa
          setTwofaValueList(prevState => {
            const newStateTwofa = [...prevState];
            for (const item of newStateTwofa) {
              if (item.id === userid) {
                item.enabled_twofa = flag;
                break;
              }
            }
            return newStateTwofa;
          })
          resolve(true);
        })
        .catch((error) => {
          callToastError(commontString.error);
          reject(true);
        });
    });
  };




  // phần main data
  const [mainData, setMainData] = useState([]);
  const [callApiMainDataStatus, setCallApiMainDataStatus] = useState(api_status.pending);
  const fetchApiGetListAllUser = function (page) {
    return new Promise((resolve, reject) => {
      if (callApiMainDataStatus === api_status.fetching) resolve([]);
      else setCallApiMainDataStatus(() => api_status.fetching);
      getAllUser({
        limit: limit.current,
        page,
      })
        .then((resp) => {
          const data = resp.data.data;
          setMainData(() => data.array);
          setCurrentPage(() => page);
          setCallApiMainDataStatus(() => api_status.fulfilled);
          setTotalItem(() => data.total);

          // lưu trữ thông tin về tạo quảng cáo của người dùng
          saveAdsList(data.array);

          // lưu trữ thông tin về twofa
          saveTwofaList(data.array);

          resolve(data.array);
        })
        .catch((err) => {
          setCallApiMainDataStatus(() => api_status.rejected);
          reject(`false`);
        });
    });
  };
  const fetchApiSearchUser = async function (page = 1, username = "") {
    try {
      if (callApiMainDataStatus === api_status.fetching) return;
      setCallApiMainDataStatus(() => api_status.fetching);
      const resp = await searchUserFromUserName({
        limit: limit.current,
        page,
        keywork: username,
      });
      const { array, total } = resp.data.data;
      setCallApiMainDataStatus(() => api_status.fulfilled);
      setMainData(() => array);
      setTotalItem(() => total);
      setCurrentPage(() => page);

      // lưu trữ thông tin về tạo quảng cáo của người dùng
      saveAdsList(array);

      // lưu trữ thông tin về twofa
      saveTwofaList(array);

    } catch (error) {
      setCallApiMainDataStatus(() => api_status.rejected);
    }
  };
  const loadData = function (page) {
    setMainData([]);
    if (searchValue.current) {
      fetchApiSearchUser(page, searchValue.current);
    } else {
      fetchApiGetListAllUser(page);
    }
  };
  const saveAdsList = (array) => {
    const adsList = []
    for (const item of array) {
      const newobj = {
        id: item.id,
        type_ads: item.type_ads,
        loading: false
      }
      adsList.push(newobj);
    }
    setAdsValueList(adsList);
  }
  const saveTwofaList = (array) => {
    const twofaList = []
    for (const item of array) {
      const newobj = {
        id: item.id,
        enabled_twofa: item.enabled_twofa,
        loading: false
      }
      twofaList.push(newobj);
    }
    setTwofaValueList(twofaList);
  }



  // phần excel
  const [callApiExportExcelStatus, setCallApiExportExcelStatus] = useState(api_status.pending);
  const exportExcellHandle = async function () {
    try {
      if (callApiExportExcelStatus === api_status.fetching) return;
      setCallApiExportExcelStatus(api_status.fetching);
      const listUser = await fetchApiGetListAllUserForExcel();
      exportExcel(listUser, "ListUser", "ListUser");
      setCallApiExportExcelStatus(api_status.fulfilled);
    } catch (error) {
      setCallApiExportExcelStatus(api_status.rejected);
    }
  };
  const fetchApiGetListAllUserForExcel = async function () {
    try {
      const resp = await getUserAllExcel();
      const array = resp.data.data;
      return array;
    } catch (error) { }
  };




  // phần lấy list coin
  const [listCoin, setListCoin] = useState();
  const fetchListCoin = () => {
    return new Promise((resolve, reject) => {
      try {
        socket.once('listCoin', resp => {
          resolve(resp)
        })
      } catch (error) {
        reject(error);
      }
    })
  }
  const renderlistCoinForHeader = () => {
    return listCoin?.map(item => {
      return (
        <th key={item?.name}>
          {item?.name}
        </th>
      )
    })
  }





  // phần render table
  const renderTableData = function () {
    if (!mainData || mainData.length <= 0) return;
    return mainData.map((item) => (
      <tr key={item.id}>
        <td>
          <NavLink to={(`${url.admin_userDetail.replace(urlParams.userId, item.id)}`)}>
            {item.id}
          </NavLink>
        </td>
        <td>{item.username}</td>
        <td>{item.email}</td>
        <td>
          {renderTypeAdsButton(adsValueList, item.id)}
        </td>
        <td>
          {renderAction2FA(twofaValueList, item.id)}
        </td>
        {renderCoinCell(item.id)}
        <td>{renderActiveSection(item.status, item.id)}</td>
      </tr>
    ));
  };
  const renderClassSpin = function () {
    return callApiMainDataStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassEmpty = function () {
    return callApiMainDataStatus !== api_status.fetching &&
      (!mainData || mainData.length <= 0)
      ? ""
      : "--d-none";
  };
  const renderTypeAdsButton = function (listType, id) {
    const type = listType.find(item => item.id === id);
    if (type.type_ads === 0) {
      return currentPagePermision === adminPermision.edit ? (
        <Switch
          on={false}
          onClick={onAdsCLickHandle.bind(null, id)}
          loading={type.loading}
        />
      ) : (
        <TagCustom
          type={TagType.error}
          content={`Disabled`}
        />
      )
    } else {
      return currentPagePermision === adminPermision.edit ? (
        <Switch
          on={true}
          onClick={offAdsClickHandle.bind(null, id)}
          loading={type.loading}
        />
      ) : (
        <TagCustom
          type={TagType.success}
          content={`Enabled`}
        />
      )
    }
  };
  const totalColumn = listCoin ? listCoin.length + 6 : 6;
  const renderCoinCell = (id) => {
    return <CoinCells
      id={id}
      listCoin={listCoin}
      listCoinName={listCoin}
    />
  }
  const renderActiveSection = function (status, id) {
    switch (status) {
      case 0 || null:
        return currentPagePermision === adminPermision.edit ? <Button onClick={activeUserClickHandle.bind(null, id)}>Active</Button> : <TagCustom
          type={TagType.pending}
          content={`Pending`}
        />;
      case 1:
        return <TagCustom
          type={TagType.success}
          content={`Actived`}
        />
      default:
        break;
    }
  };
  const renderAction2FA = function (twofaList, userid) {
    const currentValue = twofaList.find(item => item.id === userid);
    switch (currentValue?.enabled_twofa) {
      case 0:
        return currentPagePermision === adminPermision.edit ? (
          <Switch
            on={false}
            onClick={turnOn2FAClickHandle.bind(null, userid)}
            loading={currentValue.loading}
          />
        ) : (
          <TagCustom
            type={TagType.error}
            content={`Disabled`}
          />
        )

      case 1:
        return currentPagePermision === adminPermision.edit ? (
          <Switch
            on={true}
            onClick={turnOff2FAClickHandle.bind(null, userid)}
            loading={currentValue.loading}
          />
        ) :
          (
            <TagCustom
              type={TagType.success}
              content={`Enabled`}
            />
          )
      default:
        break;
    }
  };



  // phần active user
  const searchValue = useRef("");
  const fetchApiSearchUserDebouced = debounce(fetchApiSearchUser, 1000);
  const searchChangeHandle = function (ev) {
    const value = ev.target.value;
    searchValue.current = value;
    fetchApiSearchUserDebouced(1, value);
  };
  const activeUserClickHandle = function (id, event) {
    event.persist();
    const saveEvent = event.currentTarget;
    if (event.currentTarget.disabled === true) return;
    else event.currentTarget.disabled = true;
    fetchApiActiveUser(id).finally(() => {
      saveEvent.disabled = false;
    });
  };
  const fetchApiActiveUser = function (userid) {
    return new Promise((resolve, reject) => {
      activeuser({
        userid,
      })
        .then((resp) => {
          callToastSuccess(commontString.success);
          loadData(currentPage);
          resolve(true);
        })
        .catch((error) => {
          callToastError(commontString.error);
          reject(`false`);
        });
    });
  };



  // useEffect 
  useEffect(() => {
    fetchFirst();
  }, []);

  // load lần đầu cần load thêm list coin để render table
  const fetchFirst = async () => {
    try {
      if (callApiMainDataStatus === api_status.fetching) {
        return;
      }
      setCallApiMainDataStatus(api_status.fetching);
      const resp = await Promise.all([
        getAllUser({
          limit: limit.current,
          page: 1
        }),
        fetchListCoin()
      ]);
      const { total, array } = resp[0]?.data?.data;
      setCurrentPage(1);
      setTotalItem(total);
      setMainData(array);
      // lưu trữ thông tin về tạo quảng cáo của người dùng
      saveAdsList(array);
      // lưu trữ thông tin về twofa
      saveTwofaList(array);

      const coinData = resp[1];
      setListCoin(coinData);

      setCallApiMainDataStatus(api_status.fulfilled);
    } catch (error) {
      setCallApiMainDataStatus(api_status.rejected);
    }
  }

  if (currentPagePermision === adminPermision.noPermision) {
    return (
      <NoPermision />
    )
  }

  return (
    <div className="adminUser">
      <div className="row">
        <div className="col-12 px-0 pt-0 adminUser__tittle">User</div>
        <div className="col-md-12 col-6 px-0">
          <Input
            onChange={searchChangeHandle}
            placeholder={`Search by username`}
          />
        </div>
        <div className="col-md-12 col-6 adminUser__paging">
          <Pagination
            current={currentPage}
            onChange={pageChangeHandle}
            total={totalItem}
            showSizeChanger={false}
          />
        </div>
        <div className="col-12 p-0 mb-3">
          <Button
            loading={callApiExportExcelStatus === api_status.fetching}
            onClick={exportExcellHandle}
          >
            <i className="fa-solid fa-download"></i>
            Export Excell
          </Button>
        </div>
      </div>
      <div className="adminUser__content">
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>UserName</th>
              <th>Email</th>
              <th>Create Ads</th>
              <th>Two FA</th>
              {renderlistCoinForHeader()}
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {renderTableData()}
            <tr className={renderClassSpin()}>
              <td colSpan={totalColumn}>
                <div className="spin-container">
                  <Spin />
                </div>
              </td>
            </tr>
            <tr className={renderClassEmpty()}>
              <td colSpan={totalColumn}>
                <EmptyCustom />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default User;
