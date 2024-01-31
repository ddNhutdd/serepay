import React from "react";

export default function SwapAdmin() {
  return (
    <div className={css["swapAdmin"]}>
      <div className={css["swapAdmin__header"]}>
        <div className={css["swapAdmin__title"]}>Swap</div>
        <div className={`row ${css["swapAdmin__filter"]}`}>
          <div
            className={`col-md-12 col-7 row ${css["swapAdmin__list-coin"]} `}
          >
            <Button
              onClick={() => {}}
              type={buttonClassesType.outline}
              className={`widthdraw__coin-item ${"active"}`}
            >
              {"BTC"}
            </Button>
            <Button
              onClick={() => {}}
              type={buttonClassesType.outline}
              className={`widthdraw__coin-item`}
            >
              {"LTC"}
            </Button>
          </div>
          <div className={`col-md-12 col-5 ${css["swapAdmin__paging"]}`}>
            <Pagination
              showSizeChanger={false}
              current={1}
              onChange={() => {}}
              total={10}
            />
          </div>
        </div>
      </div>
      <div className={css["swapAdmin__content"]}>
        <table>
          <thead>
            <tr>
              <th></th>
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
}
