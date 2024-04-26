import { useState } from "react";
import { Button, buttonClassesType } from "src/components/Common/Button";
import { Input } from "src/components/Common/Input";
import { api_status, commontString, currencyMapper } from "src/constant";
import { callToastError, callToastSuccess } from "src/function/toast/callToast";
import { editExchange } from "src/util/adminCallApi";
import { formatNumber } from "src/util/common";


function Row(props) {
	const {
		id,
		title,
		rate
	} = props;



	// title
	const [titleInner, setTitleInner] = useState(title);
	const [titleInputValue, setTitleInputValue] = useState(titleInner);
	const titleInputValueOnchage = (ev) => {
		setTitleInputValue(ev.target.value)
	}



	// rate Inner 
	const [rateInner, setRateInner] = useState(rate);
	const [rateInnerInputValue, setRateInnerInputValue] = useState(rateInner);
	const rateInnerInputValueOnchage = (ev) => {
		setRateInnerInputValue(ev.target.value)
	}



	// trạng thái edit
	const [editStatus, setEditStatus] = useState(false);
	const editStatusClassRender = (value) => {
		return value ? '' : '--d-none';
	}



	// edit click handle 
	const editClickHandle = (ev) => {
		ev.stopPropagation();
		setEditStatus(true);
		setTitleInputValue(titleInner);
		setRateInnerInputValue(rateInner);
	}



	// cancel click Handle 
	const cancelClickHandle = () => {
		setEditStatus(false);
	}




	// save Click handle
	const [callApiStatus, setCallApiStatus] = useState();
	const fetchApiEditExchange = async function (title, rate, id) {
		try {
			if (callApiStatus === api_status.pending) return;
			else setCallApiStatus(api_status.fetching);
			await editExchange({ title, rate, id })
			callToastSuccess(commontString.success);
			setTitleInner(title);
			setRateInner(rate);
			setEditStatus(false);

		} catch (error) {
			setCallApiStatus(() => api_status.rejected);
			callToastError(commontString.error);
		}
	};
	const saveClickHandle = () => {
		fetchApiEditExchange(titleInputValue, rateInnerInputValue, id);
	}

	return (
		<tr>
			<td>
				<div className={editStatusClassRender(!editStatus)}>
					{titleInner}
				</div>
				<div className={editStatusClassRender(editStatus)}>
					<Input
						value={titleInputValue}
						onChange={titleInputValueOnchage}
					/>
				</div>
			</td>
			<td>
				<div className={editStatusClassRender(!editStatus)}>
					{formatNumber(rateInner, currencyMapper.USD, 8)}
				</div>
				<div className={editStatusClassRender(editStatus)}>
					<Input
						value={rateInnerInputValue}
						onChange={rateInnerInputValueOnchage}
					/>
				</div>
			</td>
			<td>
				<div className="d-flex alignItem-c gap-1">
					<Button
						className={editStatusClassRender(!editStatus)}
						onClick={editClickHandle}
						style={{ width: 47 }}
					>
						<i className="fa-solid fa-pen"></i>
					</Button>
					<Button
						style={{ width: 90 }}
						className={editStatusClassRender(editStatus)}
						onClick={saveClickHandle}
						loading={editStatus === api_status.fetching}
					>
						Save
					</Button>
					<Button
						style={{ width: 90 }}
						className={editStatusClassRender(editStatus)}
						type={buttonClassesType.outline}
						onClick={cancelClickHandle}
						disabled={editStatus === api_status.fetching}
					>
						Cancel
					</Button>
				</div>
			</td>
		</tr>
	)
}

export default Row