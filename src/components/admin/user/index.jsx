import { Pagination, Spin } from "antd";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "src/components/Common/Button";
import { EmptyCustom } from "src/components/Common/Empty";
import { api_status, commontString } from "src/constant";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import {
  activeuser,
  getAllUser,
  turn2fa,
  typeAds,
} from "src/util/adminCallApi";

const User = function () {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItem, setTotalItem] = useState(1);
  const [mainData, setMainData] = useState([]);
  const [callApiMainDataStatus, setCallApiMainDataStatus] = useState(
    api_status.pending
  );

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
          fetchApiGetListAllUser(currentPage);
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
    fetchApiGetListAllUser(page);
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
          fetchApiGetListAllUser(currentPage);
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
      case 0:
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
          fetchApiGetListAllUser(currentPage);
          resolve(true);
        })
        .catch((error) => {
          console.log(error);
          callToastError(commontString.error);
          reject(false);
        });
    });
  };

  return (
    <div className="adminUser">
      <div className="adminUser__tittle">User</div>
      <div className="adminUser__paging">
        <Pagination
          current={currentPage}
          onChange={pageChangeHandle}
          total={totalItem}
          showSizeChanger={false}
        />
      </div>
      <div className="adminUser__content">
        <table>
          <thead>
            <tr>
              <th>UserName</th>
              <th>Email</th>
              <th>Create Ads</th>
              <th>KYC</th>
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
