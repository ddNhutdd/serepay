import { Pagination, Spin } from "antd";
import css from "./kyc.module.scss";
import { Modal } from "antd";
import { useState, useRef, useEffect } from "react";
import { api_status, commontString, image_domain } from "src/constant";
import { EmptyCustom } from "src/components/Common/Empty";
import {
  activeUserKyc,
  cancelUserKyc,
  getKycUserPendding,
} from "src/util/adminCallApi";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { convertJsonStringToArray, zoomImage } from "src/util/common";
import { ModalConfirm } from "src/components/Common/ModalConfirm";
import { Input } from "src/components/Common/Input";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";

function KycAdmin() {
  const [page, setPage] = useState(1);
  const [totalItem, setTotalItem] = useState(1);
  const [callApiStatus, setCallApiStatus] = useState(api_status.pending);
  const [callApiRejectStatus, setCallApiRejectStatus] = useState(
    api_status.pending
  );
  const [callApiApproveStatus, setCallApiApproveStatus] = useState(
    api_status.pending
  );
  const [mainData, setMainData] = useState();
  const [isModalCheckOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState();
  const [isShowModalConfirm_approve, setIsShowModalConfirm_approve] =
    useState(false);
  const [isShowModalConfirm_reject, setIsShowModalConfirm_reject] =
    useState(false);

  const limit = useRef(10);
  const reasonElement = useRef();

  const pageChangeHandle = (page) => {
    fetchMainTable(page);
  };
  const renderTable = () => {
    if (!mainData || mainData.length <= 0) return;
    return mainData.map((item) => (
      <tr key={item.id}>
        <td>{item.username}</td>
        <td>{item.email}</td>
        <td>
          <Button onClick={showModalCheck.bind(null, item)}>Check</Button>
        </td>
      </tr>
    ));
  };
  const renderClassDataTable = () => {
    return callApiStatus !== api_status.pending &&
      callApiStatus !== api_status.fetching &&
      mainData &&
      mainData.length > 0
      ? ""
      : "--d-none";
  };
  const renderClassSpinComponent = () => {
    return callApiStatus === api_status.fetching ? "" : "--d-none";
  };
  const renderClassEmptyComponent = () => {
    return callApiStatus !== api_status.fetching &&
      (!mainData || mainData.length <= 0)
      ? ""
      : "--d-none";
  };
  const fetchMainTable = async (page) => {
    if (callApiStatus === api_status.fetching) return;
    setCallApiStatus(api_status.fetching);
    try {
      const resp = await getKycUserPendding({ limit: limit.current, page });
      const { array, total } = resp.data.data;
      console.log(resp);
      setMainData(array);
      setTotalItem(total);
      setPage(page);
      setCallApiStatus(api_status.fulfilled);
    } catch (error) {
      setCallApiStatus(api_status.rejected);
    }
  };
  const showModalCheck = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  const closeModalCheckHandle = () => {
    setIsModalOpen(false);
  };
  const modalCheckConfirmHandle = () => {
    setIsShowModalConfirm_approve(true);
  };
  const closeModalConfirm_approveHandle = () => {
    if (callApiApproveStatus === api_status.fetching) {
      return;
    }
    setIsShowModalConfirm_approve(false);
  };
  const modalCheckRejectHandle = () => {
    setIsShowModalConfirm_reject(true);
  };
  const closeModalConfirm_rejectHandle = () => {
    if (callApiRejectStatus === api_status.fetching) {
      return;
    }
    setIsShowModalConfirm_reject(false);
  };
  const approveKycHandle = async () => {
    if (callApiApproveStatus === api_status.fetching) return;
    setCallApiApproveStatus(api_status.fetching);
    try {
      const resp = await activeUserKyc({
        userid: selectedItem?.id,
      });

      const message = resp.data.message;
      callToastSuccess(message);
      fetchMainTable(page);
      setCallApiApproveStatus(api_status.fulfilled);
      closeAllModal();
    } catch (error) {
      console.log(error);
      callToastError(commontString.error);
      setCallApiApproveStatus(api_status.rejected);
    }
  };
  const rejectKycHandle = async () => {
    // validate
    if (!reasonElement.current.value) {
      callToastError(commontString.pleaseEnterReason);
      return;
    }

    //
    if (callApiRejectStatus === api_status.fetching) return;
    setCallApiRejectStatus(api_status.fetching);
    try {
      const resp = await cancelUserKyc({
        userid: selectedItem?.id,
        note: reasonElement.current.value,
      });
      const message = resp.data.message;
      callToastSuccess(message);
      fetchMainTable(page);
      setCallApiRejectStatus(api_status.fulfilled);
      closeAllModal();
    } catch (error) {
      console.log(error);
      callToastError(commontString.error);
      setCallApiRejectStatus(api_status.rejected);
    }
  };
  const closeAllModal = () => {
    setIsModalOpen(false);
    closeModalConfirm_approveHandle(false);
    closeModalConfirm_rejectHandle(false);
  };

  useEffect(() => {
    fetchMainTable(1);
  }, []);

  return (
    <div className={css["kycAdmin"]}>
      <div className={css["kycAdmin__header"]}>
        <div className={css["kycAdmin__title"]}>Deposite</div>
        <div className={`${css["kycAdmin__paging"]}`}>
          <Pagination
            current={page}
            onChange={pageChangeHandle}
            total={totalItem}
            showSizeChanger={false}
          />
        </div>
      </div>
      <div className={css["kycAdmin__content"]}>
        <table>
          <thead>
            <tr>
              <th>UserName</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className={renderClassDataTable()}>{renderTable()}</tbody>
          <tbody className={renderClassSpinComponent()}>
            <tr>
              <td colSpan={3}>
                <div className="spin-container">
                  <Spin />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody className={renderClassEmptyComponent()}>
            <tr>
              <td colSpan={3}>
                <div className="spin-container">
                  <EmptyCustom />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Modal
        footer={false}
        header={false}
        open={isModalCheckOpen}
        onCancel={closeModalCheckHandle}
        width={1000}
      >
        <div className={css["modalCheck"]}>
          <div className={css["modalCheck__Header"] + ` bb-1`}>
            <div>Check</div>
            <div
              onClick={closeModalCheckHandle}
              className={css["modalCheck__Header__close"]}
            >
              <i className="fa-solid fa-xmark"></i>
            </div>
          </div>
          <div className={css["modalCheck__Content"]}>
            <div className={css["modalCheck__Content__info"]}>
              <div className={css["modalCheck__Content__info__item"]}>
                <div>Full Name:</div>
                <div>{selectedItem?.fullname}</div>
              </div>
              <div className={css["modalCheck__Content__info__item"]}>
                <div>Phone:</div>
                <div>{selectedItem?.phone}</div>
              </div>
              <div className={css["modalCheck__Content__info__item"]}>
                <div>Address:</div>
                <div>{selectedItem?.address}</div>
              </div>
              <div className={css["modalCheck__Content__info__item"]}>
                <div>Company:</div>
                <div>{selectedItem?.company}</div>
              </div>
              <div className={css["modalCheck__Content__info__item"]}>
                <div>Passport:</div>
                <div>{selectedItem?.passport}</div>
              </div>
            </div>
            <div className={css["modalCheck__Content__image"]}>
              <div>
                <img
                  onClick={zoomImage}
                  src={image_domain.replace(
                    "images/USDT.png",
                    convertJsonStringToArray(selectedItem?.verified_images)[0]
                  )}
                  alt="image"
                />
              </div>
              <div>
                <img
                  onClick={zoomImage}
                  src={image_domain.replace(
                    "images/USDT.png",
                    convertJsonStringToArray(selectedItem?.verified_images)[1]
                  )}
                  alt="image"
                />
              </div>
              <div>
                <img
                  onClick={zoomImage}
                  src={image_domain.replace(
                    "images/USDT.png",
                    convertJsonStringToArray(selectedItem?.verified_images)[2]
                  )}
                  alt="image"
                />
              </div>
            </div>
          </div>
          <div className={css["modalCheck__Footer"]}>
            <Button onClick={modalCheckConfirmHandle}>confirm</Button>
            <Button
              onClick={modalCheckRejectHandle}
              type={buttonClassesType.outline}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>
      <ModalConfirm
        waiting={callApiApproveStatus}
        isShowModal={isShowModalConfirm_approve}
        closeModalHandle={closeModalConfirm_approveHandle}
        modalConfirmHandle={approveKycHandle}
      />
      <ModalConfirm
        title={"Reject"}
        waiting={callApiRejectStatus}
        isShowModal={isShowModalConfirm_reject}
        closeModalHandle={closeModalConfirm_rejectHandle}
        content={
          <div className={`d-flex f-c alignItem-start`}>
            <label>Reason:</label>
            <Input ref={reasonElement} />
          </div>
        }
        modalConfirmHandle={rejectKycHandle}
      />
    </div>
  );
}

export default KycAdmin;
