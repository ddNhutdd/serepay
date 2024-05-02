import { Empty } from "antd";
import { commontString } from "src/constant";

export const EmptyCustom = function ({ stringData }) {
  return <Empty description={<span>{processStringData(stringData)}</span>} />;
};

const processStringData = function (stringData) {
  if (!stringData) return commontString.noData;
  else return stringData;
};
