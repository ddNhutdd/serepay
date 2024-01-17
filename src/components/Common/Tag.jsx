import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";

export const TagType = {
  success: "success",
  pending: "processing",
  error: "error",
  warning: "warning",
  default: "default",
};

export const TagCustom = function (props) {
  const { type, content } = props;
  switch (type) {
    case TagType.success:
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          {content || "Success"}
        </Tag>
      );
    case TagType.pending:
      return (
        <Tag icon={<SyncOutlined spin />} color="processing">
          {content || "Pending"}
        </Tag>
      );
    case TagType.error:
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          {content || "Reject"}
        </Tag>
      );
    case TagType.warning:
      return (
        <Tag icon={<ExclamationCircleOutlined />} color="warning">
          {content || "Warning"}
        </Tag>
      );
    default:
      return (
        <Tag icon={<ClockCircleOutlined />} color="default">
          {content || "Default"}
        </Tag>
      );
  }
};
