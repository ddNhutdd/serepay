import CopyToClipboard from "react-copy-to-clipboard";
import { commontString } from "src/constant";
import { callToastSuccess } from "src/function/toast/callToast";
import { Button, buttonClassesType } from "../Button";

function CopyButton(props) {
	const {
		value,
		toast = commontString.success
	} = props;
	const onCopy = () => {
		callToastSuccess(toast)
	}

	return (
		<CopyToClipboard text={value}
			onCopy={onCopy}>
			<Button type={buttonClassesType.outline} style={{ height: 26, width: 35, border: 'none', background: 'transparent' }}>
				<i className="fa-regular fa-copy"></i>
			</Button>
		</CopyToClipboard>
	)
}

export default CopyButton;