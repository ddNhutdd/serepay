import React, { useState } from 'react'
import { Input } from 'src/components/Common/Input';
import css from './coin-record.module.scss';
import { Button, buttonClassesType } from 'src/components/Common/Button';
import { api_status, commontString, image_domain } from 'src/constant';
import { formatInputNumber, formatStringNumberCultureUS } from 'src/util/common';
import { updateAmountWalletToId } from 'src/util/adminCallApi';
import { callToastError, callToastSuccess } from 'src/function/toast/callToast';

function CoinRecord(props) {
	const {
		id,
		coinAmount,
		coinName,
	} = props;




	// input 
	const [inputValue, setInputValue] = useState(coinAmount);
	const inputValueOnChange = (ev) => {
		setInputValue(formatInputNumber(ev.target.value));
		setSaveButtonType(buttonClassesType.primary);
	}




	// button save
	const [saveButtonType, setSaveButtonType] = useState(buttonClassesType.outline);
	const [callApiStatus, setCallApiStatus] = useState(api_status.pending);
	const savebuttonClickHandle = () => {
		fetchApiUpdateAmountWalletToId(coinName, inputValue, id);
	}
	const fetchApiUpdateAmountWalletToId = async function (coinName, amount, id) {
		try {
			const amoutCalc = +(amount.toString()?.replaceAll(',', ''));
			if (amoutCalc <= 0) {
				return;
			}

			if (callApiStatus === api_status.fetching) {
				return;
			}
			setCallApiStatus(api_status.fetching);
			await updateAmountWalletToId({
				userid: id,
				amount: amoutCalc,
				symbol: coinName,
			});

			setSaveButtonType(buttonClassesType.outline);
			setCallApiStatus(api_status.fulfilled);
			callToastSuccess(commontString.success);
		} catch (error) {
			setCallApiStatus(api_status.rejected);
			callToastError(commontString.error);
		}
	};






	return (
		<div className={css.coinRecord}>
			<label htmlFor={id + coinName}>
				{coinName}
			</label>
			<div className={css.coinRecord__inputContainer}>
				<img src={image_domain.replace("USDT", coinName)} alt="" />
				<Input
					id={id + coinName}
					value={formatInputNumber(inputValue)}
					onChange={inputValueOnChange}
				/>
				<Button
					type={saveButtonType}
					onClick={savebuttonClickHandle}
					loading={callApiStatus === api_status.fetching}
				>
					<i className="fa-solid fa-floppy-disk"></i>
				</Button>
			</div>
		</div>
	)
}

export default CoinRecord