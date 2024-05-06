import { Pagination, Spin } from 'antd';
import css from './p2p.module.scss';
import { EmptyCustom } from 'src/components/Common/Empty';
import Tabs from '../tabs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from 'src/components/Common/Input';
import { adminPermision, api_status, commontString, currency } from 'src/constant';
import { AdminConfirmP2pCommand, getHistoryToWhereAdmin } from 'src/util/adminCallApi';
import { analysisAdminPermision, debounce, formatCurrency } from 'src/util/common';
import { availableLanguageCodeMapper } from 'src/translation/i18n';
import { Button, buttonClassesType } from 'src/components/Common/Button';
import { ModalConfirm } from 'src/components/Common/ModalConfirm';
import { callToastError, callToastSuccess } from 'src/function/toast/callToast';
import NoPermision from '../no-permision';
import { getAdminPermision } from 'src/redux/reducers/admin-permision.slice';
import { useSelector } from 'react-redux';
import { adminFunction } from '../sidebar';

function P2p() {
	const filterType = {
		name: 'name',
		pending: 'pending',
		success: 'success'
	}


	// phần kiểm tra quyền của admin
	const { permision } = useSelector(getAdminPermision);
	//const currentPagePermision = analysisAdminPermision(adminFunction.user, permision);
	const currentPagePermision = adminPermision.watch;






	// paging
	const [currentPage, setCurrentPage] = useState(1);
	const [totalItems, setTotalItems] = useState(1);
	const limit = useRef(10);
	const pageChangeHandle = (page) => {
		if (fetchApiStatus === api_status.fetching) {
			return;
		}
		fetchMainData(page)
	}

	// search name 
	const [searchInputValue, setSearchInputValue] = useState('');
	const searchInputChangeHandle = (ev) => {
		setSearchInputValue(ev.target.value);
		setFilter(filterType.name)
		fetchMainDataDebounced(1, ev.target.value);
	}

	// filter
	const [filter, setFilter] = useState(filterType.name);
	const filterButtonType = (filterType) => {
		return filter === filterType ? buttonClassesType.primary : buttonClassesType.outline;
	}
	const filterButtonTypeClickHandle = (filterValue) => {
		setSearchInputValue("")
		if (filter === filterValue) {
			setFilter(filterType.name);
			fetchAll(1);
		} else {
			setFilter(filterValue)
			switch (filterValue) {
				case filterType.pending:
					fetchPending(1);
					break;
				case filterType.success:
					fetchSuccess(1);
					break;
				default:
					break;
			}
		}
	}


	// main data
	const [mainData, setMainData] = useState([]);
	const [fetchApiStatus, setFetchApiStatus] = useState(api_status.pending);
	const fetchAll = async (page) => {
		try {
			if (fetchApiStatus === api_status.fetching) {
				return;
			}
			setFetchApiStatus(api_status.fetching);
			const resp = await getHistoryToWhereAdmin({
				page,
				limit: limit.current
			})
			setMainData(resp?.data?.data?.array);
			setTotalItems(resp?.data?.data?.total)
			setCurrentPage(page);
			setFetchApiStatus(api_status.fulfilled);
		} catch (error) {
			setFetchApiStatus(api_status.rejected);
		}
	}
	const fetchPending = async (page) => {
		try {
			if (fetchApiStatus === api_status.fetching) {
				return;
			}
			setFetchApiStatus(api_status.fetching);
			const resp = await getHistoryToWhereAdmin({
				page,
				limit: limit.current,
				where: "typeP2p=2"
			})
			setMainData(resp?.data?.data?.array);
			setTotalItems(resp?.data?.data?.total)
			setCurrentPage(page);
			setFetchApiStatus(api_status.fulfilled);
		} catch (error) {
			setFetchApiStatus(api_status.rejected);
		}
	}
	const fetchSuccess = async (page) => {
		try {
			if (fetchApiStatus === api_status.fetching) {
				return;
			}
			setFetchApiStatus(api_status.fetching);
			const resp = await getHistoryToWhereAdmin({
				page,
				limit: limit.current,
				where: "typeP2p=1"
			})
			setMainData(resp?.data?.data?.array);
			setTotalItems(resp?.data?.data?.total)
			setCurrentPage(page);
			setFetchApiStatus(api_status.fulfilled);
		} catch (error) {
			setFetchApiStatus(api_status.rejected);
		}
	}
	const fetchByName = async (page, username) => {
		try {
			if (fetchApiStatus === api_status.fetching) {
				return;
			}
			setFetchApiStatus(api_status.fetching);
			const resp = await getHistoryToWhereAdmin({
				page,
				limit: limit.current,
				where: `POSITION('${username}' IN username)`
			})
			setMainData(resp?.data?.data?.array);
			setTotalItems(resp?.data?.data?.total)
			setCurrentPage(page);
			setFetchApiStatus(api_status.fulfilled);
		} catch (error) {
			setFetchApiStatus(api_status.rejected);
		}
	}
	const fetchMainData = (page, searchInputValue = '') => {
		switch (filter) {
			case filterType.name:
				if (searchInputValue) {
					fetchByName(page, searchInputValue);
				} else if (!searchInputValue) {
					fetchAll(page);
				}
				break;

			case filterType.pending:
				fetchPending(page);
				break;

			case filterType.success:
				fetchSuccess(page);
				break;

			default:
				break;
		}
	}
	const fetchMainDataDebounced = useCallback(debounce(fetchMainData, 1000), []);



	// confirm
	const [confirmModalShow, setConfirmModalShow] = useState(false);
	const [fetchConfirmStatus, setFetchConfirmStatus] = useState(api_status.pending);
	const p2pIdSelected = useRef(null);
	const fetchConfirm = async (id) => {
		try {
			setFetchConfirmStatus(api_status.fetching)
			const resp = await AdminConfirmP2pCommand({
				idP2p: id
			});
			setFetchConfirmStatus(api_status.fulfilled);
			callToastSuccess(commontString.success);
		} catch (error) {
			const errorMess = error?.data?.response?.message;
			callToastError(errorMess || commontString.error);
			setFetchConfirmStatus(api_status.rejected);
		}
	}
	const confirmModalOpen = (id) => {
		p2pIdSelected.current = id;
		setConfirmModalShow(true)
	};
	const confirmModalClose = () => {
		setConfirmModalShow(false);
		p2pIdSelected.current = null;
	};
	const confirmHandle = async () => {
		await fetchConfirm(p2pIdSelected.current);
		fetchMainData(currentPage);
		confirmModalClose();
	}

	// render table 
	const renderClassDataTable = () => {
		return (fetchApiStatus === api_status.fulfilled || fetchApiStatus === api_status.rejected) && mainData && mainData?.length > 0 ? '' : 'd-0';
	}
	const renderClassSpinComponent = () => {
		return fetchApiStatus === api_status.fetching ? '' : 'd-0';
	}
	const renderClassEmptyComponent = () => {
		return fetchApiStatus !== api_status.fetching &&
			(!mainData || mainData.length <= 0)
			? ""
			: "--d-none";
	}
	const renderTable = (list) => {
		return list?.map((item) => {
			return (
				<tr key={item?.id}>
					<td>{item?.userNameAds}</td>
					<td>{item?.emailAds}</td>
					<td>{item?.userName}</td>
					<td>{item?.email}</td>
					<td>{item?.side}</td>
					<td>{item?.symbol}</td>
					<td>{item?.amount}</td>
					<td>
						<div style={{ whiteSpace: 'nowrap' }}>
							{item?.rate} $
						</div>
					</td>
					<td>
						<div style={{ whiteSpace: 'nowrap' }}>
							{formatCurrency(availableLanguageCodeMapper.en, currency.vnd, item?.pay, false)} vnd
						</div>
					</td>
					<td>{item?.created_at}</td>
					<td>
						<div style={{ whiteSpace: 'nowrap' }}>
							{item?.bankName}
						</div>
					</td>
					<td>{item?.ownerAccount}</td>
					<td>{item?.numberBank}</td>
					<td>{item?.code}</td>
					{
						currentPagePermision === adminPermision.edit && <td>
							{item?.typeP2p === 2 && (
								<Button onClick={confirmModalOpen.bind(null, item?.id)} type={buttonClassesType.primary}>Confirm</Button>
							)}
						</td>
					}
				</tr >
			)
		})
	}






	// useEffect
	useEffect(() => {
		fetchMainData(1);
	}, [])




	if (currentPagePermision === adminPermision.noPermision) {
		return (
			<NoPermision />
		)
	}




	return (
		<>
			<div className={css.p2p}>
				<div className={css.p2p__header}>
					<div className={css["p2p__title"]}>P2P</div>
					<div className={`row ${css["p2p__filter"]}`}>
						<div className={`col-md-12 col-6 pl-0`}>
							<div className='d-flex alignItem-c gap-1 mb-2'>
								<Button
									type={filterButtonType(filterType.pending)}
									onClick={filterButtonTypeClickHandle.bind(null, filterType.pending)}
								>
									Pending
								</Button>
								<Button
									type={filterButtonType(filterType.success)}
									onClick={filterButtonTypeClickHandle.bind(null, filterType.success)}
								>
									Success
								</Button>
							</div>
							<Input
								value={searchInputValue}
								onChange={searchInputChangeHandle}
								placeholder="Type a name"
							/>
						</div>
						<div className={`col-md-12 col-6 ${css["p2p__paging"]}`}>
							<Pagination
								current={currentPage}
								onChange={pageChangeHandle}
								total={totalItems}
								showSizeChanger={false}
							/>
						</div>
					</div>
				</div>
				<div className={css["p2p__content"]}>
					<table>
						<thead>
							<tr>
								<th>Advertising Owner</th>
								<th>Email of the Advertiser</th>
								<th>Trander</th>
								<th>Email of the Trander</th>
								<th>Ads action</th>
								<th>Token</th>
								<th>Amount</th>
								<th>Rate</th>
								<th>Pay</th>
								<th>Create At</th>
								<th>Bank</th>
								<th>Account</th>
								<th>Number Account</th>
								<th>Code</th>
								{
									currentPagePermision === adminPermision.edit && <th>Action</th>
								}
							</tr>
						</thead>
						<tbody className={renderClassDataTable()}>
							{renderTable(mainData)}
						</tbody>
						<tbody className={renderClassSpinComponent()}>
							<tr>
								<td colSpan={15}>
									<div className="spin-container">
										<Spin />
									</div>
								</td>
							</tr>
						</tbody>
						<tbody className={renderClassEmptyComponent()}>
							<tr>
								<td colSpan={15}>
									<div className="spin-container">
										<EmptyCustom />
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div >
			<ModalConfirm
				modalConfirmHandle={confirmHandle}
				isShowModal={confirmModalShow}
				waiting={fetchConfirmStatus}
				closeModalHandle={confirmModalClose}
			/>
		</>
	)
}

export default P2p