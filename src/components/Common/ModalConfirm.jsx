import { Modal } from "antd";
import { api_status } from "src/constant";

export const ModalConfirm = function (prop) {
  const {
    title = "Confirm",
    content = "Are you sure ?",
    buttonOkText = "Ok",
    buttonCancelText = "Cancel",
    modalConfirmHandle,
    waiting,
    closeModalHandle,
    isShowModal,
  } = prop;
  return (
    <>
      <Modal title={null} open={isShowModal} footer={null}>
        <div className="modalConfirmContainer">
          <div className="modalConfirmHeader">
            {title}
            <span onClick={closeModalHandle}>
              <i className="fa-solid fa-xmark"></i>
            </span>
          </div>
          <div className="modalConfirmContent">{content}</div>
          <div className="modalConfirmFooter">
            <button
              onClick={closeModalHandle}
              className={`modalConfirmCancel ${
                waiting === api_status.fetching ? "disabled" : ""
              }`}
            >
              {buttonCancelText}
            </button>
            <button
              onClick={modalConfirmHandle}
              className={`modalConfirmOk ${
                waiting === api_status.fetching ? "disable" : ""
              }`}
            >
              <div
                className={`loader ${
                  waiting === api_status.fetching ? "" : "--d-none"
                }`}
              ></div>
              {buttonOkText}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
