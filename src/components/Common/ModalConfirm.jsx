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
    isHiddenOkButton = false,
    isHiddenCancelButton = false,
  } = prop;

  const hiddenButtonOk = function () {
    return isHiddenOkButton ? "--d-none" : "";
  };
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
            {
              isHiddenCancelButton === false && <button
                onClick={closeModalHandle}
                className={`modalConfirmCancel ${waiting === api_status.fetching ? "disabled" : ""
                  }`}
              >
                {buttonCancelText}
              </button>
            }
            <button
              onClick={modalConfirmHandle}
              className={`modalConfirmOk ${hiddenButtonOk()} ${waiting === api_status.fetching ? "disable" : ""
                }`}
            >
              <div
                className={`loader ${waiting === api_status.fetching ? "" : "--d-none"
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
