import { Pagination, Spin } from "antd";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "src/components/Common/Button";
import { EmptyCustom } from "src/components/Common/Empty";
import { Input } from "src/components/Common/Input";
import { api_status, commontString } from "src/constant";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import {
  activeuser,
  getAllUser,
  searchUserFromUserName,
  turn2fa,
  typeAds,
} from "src/util/adminCallApi";
import { debounce, exportExcel } from "src/util/common";

const User = function () {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItem, setTotalItem] = useState(1);
  const [mainData, setMainData] = useState([]);
  const [callApiMainDataStatus, setCallApiMainDataStatus] = useState(
    api_status.pending
  );
  const [callApiExportExcelStatus, setCallApiExportExcelStatus] = useState(
    api_status.pending
  );
  const searchValue = useRef("");
  const limit = useRef(10);

  useEffect(() => {
    fetchApiGetListAllUser(1);
  }, []);

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
          resolve(data.array);
        })
        .catch((err) => {
          setCallApiMainDataStatus(() => api_status.rejected);
          reject(false);
        });
    });
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
  const renderTypeAdsButton = function (type, id) {
    if (type === 0) {
      return <Button onClick={onAdsCLickHandle.bind(null, id)}>On</Button>;
    } else {
      return <Button onClick={offAdsClickHandle.bind(null, id)}>Off</Button>;
    }
  };
  const onAdsCLickHandle = function (id, event) {
    event.persist();
    const saveEvent = event.currentTarget;
    if (event.currentTarget.disabled === true) return;
    event.currentTarget.disabled = true;
    fetchApiTypeAds(id, 1).finally(() => {
      saveEvent.disabled = false;
    });
  };
  const offAdsClickHandle = function (id, event) {
    event.persist();
    const saveEvent = event.currentTarget;
    if (event.currentTarget.disabled === true) return;
    event.currentTarget.disabled = true;
    fetchApiTypeAds(id, 0).finally(() => {
      saveEvent.disabled = false;
    });
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
          loadData(currentPage);
          resolve(true);
        })
        .catch((error) => {
          setCallApiMainDataStatus(() => api_status.rejected);
          callToastError(commontString.error);
          reject(false);
        });
    });
  };
  const renderTableData = function () {
    if (!mainData || mainData.length <= 0) return;
    return mainData.map((item) => (
      <tr key={item.id}>
        <td>{item.username}</td>
        <td>{item.email}</td>
        <td>{renderTypeAdsButton(item.type_ads, item.id)}</td>
        <td>{renderAction2FA(item.enabled_twofa, item.id)}</td>
        <td>{renderActiveSection(item.status, item.id)}</td>
      </tr>
    ));
  };
  const pageChangeHandle = function (page) {
    loadData(page);
  };
  const loadData = function (page) {
    if (searchValue.current) {
      fetchApiSearchUser(page, searchValue.current);
    } else {
      fetchApiGetListAllUser(page);
    }
  };
  const renderAction2FA = function (enabled_twofa, userid) {
    switch (enabled_twofa) {
      case 0:
        return (
          <Button onClick={turnOn2FAClickHandle.bind(null, userid)}>
            Turn On 2FA
          </Button>
        );
      case 1:
        return (
          <Button onClick={turnOff2FAClickHandle.bind(null, userid)}>
            Turn Off 2FA
          </Button>
        );
      default:
        break;
    }
  };
  const turnOn2FAClickHandle = function (userid, e) {
    e.persist();
    const saveEvent = e.currentTarget;
    if (saveEvent.disabled === true) return;
    else saveEvent.disabled = true;
    fetchApiTurn2FA(userid, 1).finally(() => (saveEvent.disabled = false));
  };
  const turnOff2FAClickHandle = function (userid, e) {
    e.persist();
    const saveEvent = e.currentTarget;
    if (saveEvent.disabled === true) return;
    else saveEvent.disabled = true;
    fetchApiTurn2FA(userid, 0).finally(() => (saveEvent.disabled = false));
  };
  const fetchApiTurn2FA = function (userid, flag) {
    return new Promise((resolve, reject) => {
      turn2fa({
        userid,
        flag,
      })
        .then((resp) => {
          callToastSuccess(commontString.success);
          loadData(currentPage);
          resolve(true);
        })
        .catch((error) => {
          callToastError(commontString.error);
          reject(true);
        });
    });
  };
  const renderActiveSection = function (status, id) {
    switch (status) {
      case 0 || null:
        return (
          <Button onClick={activeUserClickHandle.bind(null, id)}>Active</Button>
        );
      case 1:
        return <></>;
      default:
        break;
    }
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
          reject(false);
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
    } catch (error) {
      setCallApiMainDataStatus(() => api_status.rejected);
    }
  };
  const fetchApiSearchUserDebouced = debounce(fetchApiSearchUser, 1000);
  const searchChangeHandle = function (ev) {
    const value = ev.target.value;
    searchValue.current = value;
    fetchApiSearchUserDebouced(1, value);
  };
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
  const fetchApiGetListAllUserForExcel = function () {
    return new Promise((resolve, reject) => {
      getAllUser({
        limit: 999999,
        page: 1,
      })
        .then((resp) => {
          const data = resp.data.data;
          resolve(data.array);
        })
        .catch((err) => {
          reject(false);
        });
    });
  };

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
            Export Excell All Users
          </Button>
        </div>
      </div>
      <div className="adminUser__content">
        <table>
          <thead>
            <tr>
              <th>UserName</th>
              <th>Email</th>
              <th>Create Ads</th>
              <th>Two FA</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {renderTableData()}
            <tr className={renderClassSpin()}>
              <td colSpan={5}>
                <div className="spin-container">
                  <Spin />
                </div>
              </td>
            </tr>
            <tr className={renderClassEmpty()}>
              <td colSpan={5}>
                <EmptyCustom />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default User;
