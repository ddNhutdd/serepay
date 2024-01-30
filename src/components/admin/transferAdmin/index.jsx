import { Pagination, Spin } from "antd";
import React, { useState } from "react";
import { EmptyCustom } from "src/components/Common/Empty";
import css from "./transferAdmin.module.scss";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { api_status } from "src/constant";

export default function TransferAdmin() {
  const [callApiMainApiStatus, setCallApiMainApiStatus] = useState(
    api_status.pending
  );

  return (
    <div className={css["transferAdmin"]}>
      <div className={css["transferAdmin__header"]}>
        <div className={css["transferAdmin__title"]}>Transfer</div>
        <div className={`row ${css["transferAdmin__filter"]}`}>
          <div
            className={`col-md-12 col-7 row ${css["transferAdmin__list-coin"]}`}
          >
            <Button
              onClick={() => {}}
              type={buttonClassesType.outline}
              className={`${css["transferAdmin__coin-item"]} ${css["active"]}`}
            >
              {"coinname"}
            </Button>
            <Button
              onClick={() => {}}
              type={buttonClassesType.outline}
              className={`${css["transferAdmin__coin-item"]}`}
            >
              {"coin.name"}
            </Button>
          </div>
          <div className={`col-md-12 col-5 ${css["transferAdmin__paging"]}`}>
            <Pagination
              showSizeChanger={false}
              // current={currentPage}
              // onChange={pageChangeHandle}
              // total={totalItem}
            />
          </div>
        </div>
      </div>
      <div className={css["transferAdmin__content"]}>
        <table>
          <thead>
            <tr>
              <th>Coin_key</th>
              <th>Create_at</th>
              <th>Mount</th>
              <th>Address From</th>
              <th>Address To</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody className="--d-none">
            <tr>
              <td>1</td>
              <td>1</td>
              <td>1</td>
              <td>1</td>
              <td>1</td>
              <td>1</td>
            </tr>
          </tbody>
          <tbody className="--d-none">
            <tr>
              <td colSpan={6}>
                <div className="spin-container">
                  <Spin />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody className="">
            <tr>
              <td colSpan={6}>
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
