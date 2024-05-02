import CopyButton from 'src/components/Common/copy-button';
import css from './widthdraw-record.module.scss';
import { Button, buttonClassesType } from 'src/components/Common/Button';
import { TagCustom, TagType } from 'src/components/Common/Tag';
import { shortenHash } from 'src/util/common';
import { api_status, commontString, image_domain } from 'src/constant';
import { ModalConfirm } from 'src/components/Common/ModalConfirm';
import { useState } from 'react';
import { callToastSuccess } from 'src/function/toast/callToast';
import { activeWidthdraw, cancelWidthdraw } from 'src/util/adminCallApi';
import { Input } from 'src/components/Common/Input';

function WidthdrawRecord(props) {
	const {
		content
	} = props;



	// status Inner
	const [statusInner, setStatusInner] = useState(content?.status);



	// render status
	const renderStatus = (status) => {
		switch (status) {
			case 0:
				return <TagCustom type={TagType.error} />;
			case 1:
				return <TagCustom type={TagType.success} />;
			case 2:
				return (
					<>
						<Button
							onClick={confirmModalOpen}
						>
							Confirm
						</Button>
						<Button
							type={buttonClassesType.outline}
							onClick={rejectModalOpen}
						>
							Reject
						</Button>
					</>
				);
			default:
				return null;
		}
	}




	// api status
	const [callApiStatus, setCallApiStatus] = useState(api_status.pending);





	// modal confirm
	const [confirmModalShow, setModalConfirmShow] = useState();
	const confirmModalOpen = () => {
		setModalConfirmShow(true)
	}
	const confirmModalClose = () => {
		setModalConfirmShow(false)
	}
	const fetchConfirmApi = async () => {
		try {
			if (callApiStatus === api_status.fetching) {
				return;
			}
			setCallApiStatus(api_status.fetching);
			const resp = await activeWidthdraw({
				id: content?.id
			});

			callToastSuccess(commontString.success)
			confirmModalClose();
			setStatusInner(1);
			setCallApiStatus(api_status.fulfilled);

		} catch (error) {
			setCallApiStatus(api_status.rejected);
		}
	}







	// modal reject
	const [rejectModalShow, setRejectModalShow] = useState();
	const [reasonInputValue, setReasonInputValue] = useState();
	const rejectModalOpen = () => {
		setRejectModalShow(true);
	}
	const rejectModalClose = () => {
		setRejectModalShow(false)
	}
	const fetchRejectApi = async () => {
		try {
			if (callApiStatus === api_status.fetching) {
				return;
			}
			setCallApiStatus(api_status.fetching);
			const resp = await cancelWidthdraw({
				id: content?.id,
				note: reasonInputValue,
			})

			callToastSuccess(commontString.success)
			rejectModalClose();
			setStatusInner(0);
			setCallApiStatus(api_status.fulfilled);

		} catch (error) {
			setCallApiStatus(api_status.rejected);
		}
	}
	const reasonInputValueChangeHandle = (ev) => {
		setReasonInputValue(ev.target.value);
	}







	return (
		<>
			<div className={css.widthdrawRecord}>
				<div>
					{content?.created_at}
				</div>
				{
					content?.form_address && (
						<>
							<div className={css.widthdrawRecord__row}>
								<span className={css[`widthdrawRecord--second`]}>
									From Address:
								</span>
								{" "}
								{shortenHash(content?.form_address)}
								<CopyButton value={content?.form_address} />
							</div>
							<div className={css.widthdrawRecord__row}>
								<span className={css[`widthdrawRecord--second`]}>
									Amount Before From:
								</span>
								<img style={{ width: 20, height: 20, objectFit: 'cover' }} src={image_domain.replace('USDT', content?.coin_key.toUpperCase())} alt={content?.coin_key} />
								{content?.amountBeforeFrom}
							</div>
							<div className={css.widthdrawRecord__row}>
								<span className={css[`widthdrawRecord--second`]}>
									Amount After From:
								</span>
								<img style={{ width: 20, height: 20, objectFit: 'cover' }} src={image_domain.replace('USDT', content?.coin_key.toUpperCase())} alt={content?.coin_key} />
								{content?.amountAfterFrom}
							</div>
						</>
					)
				}
				{
					content?.to_address && (
						<>
							<div className={css.widthdrawRecord__row}>
								<span className={css[`widthdrawRecord--second`]}>
									To Address:
								</span>
								{" "}
								{shortenHash(content?.to_address)}
								<CopyButton value={content?.to_address} />
							</div>
							<div className={css.widthdrawRecord__row}>
								<span className={css[`widthdrawRecord--second`]}>
									Amount Before To:
								</span>
								<img style={{ width: 20, height: 20, objectFit: 'cover' }} src={image_domain.replace('USDT', content?.coin_key.toUpperCase())} alt={content?.coin_key} />
								{content?.amountBeforeTo}
							</div>
							<div className={css.widthdrawRecord__row}>
								<span className={css[`widthdrawRecord--second`]}>
									Amount After To:
								</span>
								<img style={{ width: 20, height: 20, objectFit: 'cover' }} src={image_domain.replace('USDT', content?.coin_key.toUpperCase())} alt={content?.coin_key} />
								{content?.amountAfterTo}
							</div>
						</>
					)
				}
				{
					content?.hash && <div className={css.widthdrawRecord__row}>
						<span className={css[`widthdrawRecord--second`]}>
							Hash:
						</span>
						{" "}
						{shortenHash(content?.hash)}
						<CopyButton value={content?.hash} />
					</div>
				}
				<div className={css.widthdrawRecord__row}>
					<span className={css[`widthdrawRecord--second`]}>
						Amount:
					</span>
					<img style={{ width: 20, height: 20, objectFit: 'cover' }} src={image_domain.replace('USDT', content?.coin_key.toUpperCase())} alt={content?.coin_key} />
					{content?.amount}
				</div>
				<div className={`${css.widthdrawRecord__row}`}>
					{renderStatus(statusInner)}
				</div>
				<div className={css.widthdrawRecord__note}>
					{content?.note}
				</div>
			</div>
			<ModalConfirm
				title={`Confirm`}
				modalConfirmHandle={fetchConfirmApi}
				waiting={callApiStatus === api_status.fetching}
				closeModalHandle={confirmModalClose}
				isShowModal={confirmModalShow}
			/>
			<ModalConfirm
				title={`Reject`}
				modalConfirmHandle={fetchRejectApi}
				waiting={callApiStatus === api_status.fetching}
				closeModalHandle={rejectModalClose}
				content={(
					<div>
						<div>
							Reason
						</div>
						<Input value={reasonInputValue} onChange={reasonInputValueChangeHandle} />
					</div>
				)}
				isShowModal={rejectModalShow}
			/>
		</>
	)
}

export default WidthdrawRecord