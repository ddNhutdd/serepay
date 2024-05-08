import { ModalConfirm } from 'src/components/Common/ModalConfirm';
import css from '../user-detail.module.scss';
import { Pagination, Spin } from 'antd';
import { adminPermision, api_status, commontString, image_domain, url, urlParams } from 'src/constant';
import CopyButton from 'src/components/Common/copy-button';
import { TagCustom, TagType } from 'src/components/Common/Tag';
import { Button, buttonClassesType } from 'src/components/Common/Button';
import { EmptyCustom } from 'src/components/Common/Empty';
import { Input } from 'src/components/Common/Input';
import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { activeWidthdraw, cancelWidthdraw, getWalletToWithdrawWhere } from 'src/util/adminCallApi';
import { analysisAdminPermision, deepCopyArray, deepCopyObject, formatNumber, rountRange, shortenHash } from 'src/util/common';
import { availableLanguage } from 'src/translation/i18n';
import { callToastSuccess } from 'src/function/toast/callToast';
import { DrillContext } from 'src/context/drill';
import { NavLink } from 'react-router-dom';
import { adminFunction } from '../../sidebar';
import { getAdminPermision } from 'src/redux/reducers/admin-permision.slice';
import { useSelector } from 'react-redux';


function WithdrawHistory() {

	const {
		userid: id
	} = useParams();
	const [profile, renderTitle, listCoin] = useContext(DrillContext);







	// phần kiểm tra quyền của admin
	const { permision } = useSelector(getAdminPermision);
	const currentPagePermision = analysisAdminPermision(adminFunction.user, permision);





	// phần phân trang
	const [page, setPage] = useState(1);
	const [totalItems, setTotalItems] = useState(1);
	const limit = useRef(10);
	const pageChangeHandle = (page) => {
		fetchMainData(page);
	}



	// phần fetch data
	const [mainData, setMainData] = useState([]);
	const [fetchApiStatus, setFetchApiStatus] = useState(api_status.pending);
	const fetchMainData = async (page) => {
		try {

			if (fetchApiStatus === api_status.fetching) {
				return;
			}
			setFetchApiStatus(api_status.fetching)

			const resp = await getWalletToWithdrawWhere({
				limit: limit.current,
				page,
				where: `user_id=${id}`
			});
			const { array, total } = resp?.data?.data;
			setMainData(array);
			setTotalItems(total);
			setPage(page)
			setFetchApiStatus(api_status.fulfilled)
		} catch (error) {
			setFetchApiStatus(api_status.rejected)
		}
	}



	// phần render table
	const classFetching = fetchApiStatus === api_status.fetching ? '' : '--d-none';
	const classEmpty = fetchApiStatus !== api_status.fetching && (!mainData || mainData?.length <= 0) ? '' : '--d-none';
	const classContent = fetchApiStatus !== api_status.fetching && mainData && mainData?.length > 0 ? '' : '--d-none';
	const renderStatus = (status) => {
		switch (status) {
			case 0:
				return <TagCustom type={TagType.error} />;
			case 1:
				return <TagCustom type={TagType.success} />;
			default:
				return null;
		}
	}
	const renderTable = () => {
		return mainData?.map(item => {
			return (
				<tr key={item?.id}>
					<td>
						<div className='d-flex alignItem-c gap-1'>
							<img src={image_domain.replace("USDT", item?.coin_key.toUpperCase())} alt={item?.coin_key} />
							{formatNumber(item?.amount, availableLanguage.en, rountRange(
								listCoin?.find((coin) => coin?.name === item?.coin_key?.toUpperCase())
									?.price || 10000
							))}
						</div>
					</td>
					<td>
						{
							item?.form_address && <div className='d-flex alignItem-c gap-1'>
								<div style={{ whiteSpace: 'nowrap' }}>
									{shortenHash(item?.form_address)}
								</div>
								<CopyButton
									value={item?.form_address}
								/>
							</div>

						}

					</td>
					<td>
						<div className='d-flex alignItem-c gap-1'>
							<img src={image_domain.replace("USDT", item?.coin_key.toUpperCase())} alt={item?.coin_key} />
							{formatNumber(item?.amountBeforeFrom, availableLanguage.en, rountRange(
								listCoin?.find((coin) => coin?.name === item?.coin_key?.toUpperCase())
									?.price || 10000
							))}
						</div>
					</td>
					<td>
						<div className='d-flex alignItem-c gap-1'>
							<img src={image_domain.replace("USDT", item?.coin_key.toUpperCase())} alt={item?.coin_key} />
							{formatNumber(item?.amountAfterFrom, availableLanguage.en, rountRange(
								listCoin?.find((coin) => coin?.name === item?.coin_key?.toUpperCase())
									?.price || 10000
							))}
						</div>
					</td>
					<td>
						<div className='d-flex alignItem-c gap-1'>
							<div style={{ whiteSpace: 'nowrap' }}>
								<NavLink className={`--link`} to={url.admin_userDetail.replace(urlParams.userId, item?.user_id)}>
									{shortenHash(item?.to_address)}
								</NavLink>
							</div>
							<CopyButton
								value={item?.to_address}
							/>
						</div>
					</td>
					<td>
						<div className='d-flex alignItem-c gap-1'>
							<img src={image_domain.replace("USDT", item?.coin_key.toUpperCase())} alt={item?.coin_key} />
							{formatNumber(item?.amountBeforeTo, availableLanguage.en, rountRange(
								listCoin?.find((coin) => coin?.name === item?.coin_key?.toUpperCase())
									?.price || 10000
							))}
						</div>
					</td>
					<td>
						<div className='d-flex alignItem-c gap-1'>
							<img src={image_domain.replace("USDT", item?.coin_key.toUpperCase())} alt={item?.coin_key} />
							{formatNumber(item?.amountAfterTo, availableLanguage.en, rountRange(
								listCoin?.find((coin) => coin?.name === item?.coin_key?.toUpperCase())
									?.price || 10000
							))}
						</div>
					</td>
					<td>
						{
							item?.hash && <div className='d-flex alignItem-c gap-1'>
								<div style={{ whiteSpace: 'nowrap' }}>
									{shortenHash(item?.hash)}
								</div>
								<CopyButton
									value={item?.hash}
								/>
							</div>
						}
					</td>
					<td>
						{item?.created_at}
					</td>
					<td>
						{item?.note !== null && item?.note !== 'null' && item?.note}
					</td>
					<td>
						{renderStatus(item?.status)}
					</td>
					{
						currentPagePermision === adminPermision.edit && <td>
							{item?.status === 2 && <div className='d-flex alignItem-c gap-1'>
								<Button
									onClick={confirmModalOpen.bind(null, item?.id)}
								>
									Confirm
								</Button>
								<Button
									onClick={rejectModalOpen.bind(null, item?.id)}
									type={buttonClassesType.outline}
								>
									Reject
								</Button>
							</div>}

						</td>
					}
				</tr >
			)
		})
	}



	// lưu lại id để sử dụng cho hai modal confirm và reject
	const withdrawId = useRef();





	// modal confirm
	const [confirmModalShow, setConfirmModalShow] = useState(false);
	const [fetchApiConfirmStatus, setFetchApiConfirmStatus] = useState(api_status.pending);
	const confirmModalOpen = (id) => {
		withdrawId.current = id;
		setConfirmModalShow(true);
	}
	const confirmModalClose = () => {
		setConfirmModalShow(false);
	}
	const fetchConfirmApi = async () => {
		try {
			if (fetchApiConfirmStatus === api_status.fetching) {
				return;
			}
			setFetchApiConfirmStatus(api_status.fetching);
			await activeWidthdraw({
				id: withdrawId.current
			});

			callToastSuccess(commontString.success);
			setMainData(state => {
				const newState = deepCopyArray(state);
				const findedItem = newState.find(item => item.id === withdrawId.current);
				findedItem.status = 1;
				return newState;
			})
			confirmModalClose();
			setFetchApiConfirmStatus(api_status.fulfilled);

		} catch (error) {
			setFetchApiConfirmStatus(api_status.rejected);
		}
	}





	// modal reject
	const [rejectModalShow, setRejectModalShow] = useState(false);
	const [fetchApiRejectStatus, setFetchApiRejectStatus] = useState(api_status.pending);
	const [reasonInputValue, setReasonInputValue] = useState('');
	const reasonInputValueChangeHandle = (ev) => {
		setReasonInputValue(ev.target.value)
	}
	const rejectModalOpen = (id) => {
		withdrawId.current = id;
		setRejectModalShow(true);
	}
	const rejectModalClose = () => {
		setRejectModalShow(false);
	}
	const fetchRejectApi = async () => {
		try {
			if (fetchApiRejectStatus === api_status.fetching) {
				return;
			}
			setFetchApiRejectStatus(api_status.fetching);
			await cancelWidthdraw({
				id: withdrawId.current,
				note: reasonInputValue,
			})

			callToastSuccess(commontString.success)
			rejectModalClose();
			setMainData(state => {
				const newState = deepCopyArray(state);
				const findedItem = newState.find(item => item.id === withdrawId.current);
				findedItem.status = 0;
				return newState;
			})
			setFetchApiRejectStatus(api_status.fulfilled);

		} catch (error) {
			setFetchApiRejectStatus(api_status.rejected);
		}
	}








	// useEffect
	useEffect(() => {
		fetchMainData(1)
	}, [])



	return (
		<>
			<div className={css[`userDetail--box`]}>
				<div className={css.userDetail__sectionTable}>
					<div className='d-flex alignItem-c justify-sb mb-2 f-lg-c'>
						<div className={css[`userDetail--title`]}>
							Withdraw History {renderTitle(profile)}
						</div>
						<Pagination
							showSizeChanger={false}
							current={page}
							onChange={pageChangeHandle}
							total={totalItems}
						/>
					</div>
					<div className={css[`userDetail--tableContainer`]}>
						<table>
							<thead>
								<tr>
									<th>Amount</th>
									<th>From Address</th>
									<th>Amount Before From</th>
									<th>Amount After From</th>
									<th>To Address</th>
									<th>Amount Before To</th>
									<th>Amount After To</th>
									<th>Hash</th>
									<th>Time</th>
									<th>Note</th>
									<th>Status</th>
									{
										currentPagePermision === adminPermision.edit && <th>
											<i className="fa-solid fa-gears"></i>
										</th>
									}
								</tr>
							</thead>
							<tbody className={classContent}>
								{renderTable()}
							</tbody>
							<tbody className={classFetching}>
								<tr>
									<td colSpan={12}>
										<div className='spin-container'>
											<Spin />
										</div>
									</td>
								</tr>
							</tbody>
							<tbody className={classEmpty}>
								<tr>
									<td colSpan={12}>
										<div className='spin-container'>
											<EmptyCustom />
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>

			<ModalConfirm
				title="Confirm Transfer"
				content="Are you sure ?"
				modalConfirmHandle={fetchConfirmApi}
				waiting={fetchApiConfirmStatus === api_status.fetching}
				closeModalHandle={confirmModalClose}
				isShowModal={confirmModalShow}
			/>
			<ModalConfirm
				title="Reject Transfer"
				content={(
					<>
						<label htmlFor="rejectTransferInputId">
							Reason
						</label>
						<Input
							value={reasonInputValue}
							onChange={reasonInputValueChangeHandle}
							id={`rejectTransferInputId`}
						/>
					</>
				)}
				modalConfirmHandle={fetchRejectApi}
				waiting={fetchApiRejectStatus === api_status.fetching}
				closeModalHandle={rejectModalClose}
				isShowModal={rejectModalShow}
			/>
		</>
	)
}

export default WithdrawHistory