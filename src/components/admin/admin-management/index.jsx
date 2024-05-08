import { Pagination, Spin } from 'antd';
import css from './admin-management.module.scss';
import { useEffect, useRef, useState } from 'react';
import useAsync from 'src/hooks/call-api';
import { addAdmin, deleteAdmin, editAdmin, getAdmin } from 'src/util/adminCallApi';
import { adminPermision, api_status, commontString } from 'src/constant';
import { EmptyCustom } from 'src/components/Common/Empty';

import { adminFunction } from '../sidebar';
import { analysisAdminPermision, deepCopyObject } from 'src/util/common';
import AddAdmin from './add-admin';
import { callToastError, callToastSuccess } from 'src/function/toast/callToast';
import { Button, buttonClassesType } from 'src/components/Common/Button';
import { ModalConfirm } from 'src/components/Common/ModalConfirm';
import EditPermistionContent from './edit-permision-content';
import { getAdminPermision } from 'src/redux/reducers/admin-permision.slice';
import { useSelector } from 'react-redux';
import NoPermision from '../no-permision';


function AdminManagement() {


	// phần kiểm tra quyền của admin
	const { permision } = useSelector(getAdminPermision);
	const currentPagePermision = analysisAdminPermision(adminFunction.admin, permision);






	// phần phân trang
	const [page, setPage] = useState(1);
	const [totalItems, setTotalItems] = useState(1);
	const limit = useRef(10);
	const pageChangeHandle = () => {

	}





	// phần main data 
	const getGetAdmin = async (page) => {
		const resp = await getAdmin(
			{
				limit: limit.current,
				page
			}
		)

		const data = resp?.data?.data;
		setPage(page);
		setTotalItems(data?.total);

		return data?.array
	}
	const [mainData, mainDataError, fetchMainDataStatus, fetchGetAdmin] = useAsync(getGetAdmin, 1);
	useEffect(() => {
		if (mainDataError) {
			const mess = mainDataError?.response?.data?.message;
			callToastError(mess)
		}
	}, [mainDataError])









	// phần render table 
	const isFetching = fetchMainDataStatus === api_status.fetching ? '' : '--d-none';
	const isEmpty = fetchMainDataStatus !== api_status.fetching && (!mainData || mainData.length <= 0) ? '' : '--d-none';
	const isContent = fetchMainDataStatus !== api_status.fetching && mainData && mainData.length > 0 ? '' : '--d-none';
	const renderPermisionInCell = (permision) => {
		switch (permision) {
			case adminPermision.noPermision:
				return 'No Permision';
			case adminPermision.watch:
				return 'View Only';
			case adminPermision.edit:
				return 'Edit';
			default:
				break;
		}
	}
	const renderTable = (mainData) => {
		return mainData?.map(item => {
			return (
				<tr key={item?.id}>
					<td>{item?.userName}</td>
					<td>{item?.email}</td>
					<td>
						{renderPermisionInCell(analysisAdminPermision(adminFunction.user, item))}
					</td>
					<td>
						{renderPermisionInCell(analysisAdminPermision(adminFunction.ads, item))}
					</td>
					<td>
						{renderPermisionInCell(analysisAdminPermision(adminFunction.exchange, item))}
					</td>
					<td>
						{renderPermisionInCell(analysisAdminPermision(adminFunction.widthdraw, item))}
					</td>
					<td>
						{renderPermisionInCell(analysisAdminPermision(adminFunction.config, item))}
					</td>
					<td>
						{renderPermisionInCell(analysisAdminPermision(adminFunction.transfer, item))}
					</td>
					<td>
						{renderPermisionInCell(analysisAdminPermision(adminFunction.swap, item))}
					</td>
					<td>
						{renderPermisionInCell(analysisAdminPermision(adminFunction.deposit, item))}
					</td>
					<td>
						{renderPermisionInCell(analysisAdminPermision(adminFunction.p2p, item))}
					</td>
					<td>
						{renderPermisionInCell(analysisAdminPermision(adminFunction.admin, item))}
					</td>
					{
						currentPagePermision === adminPermision.edit && <td>
							<div className='d-flex gap-2 justify-c'>
								<Button
									onClick={openModalPermistion.bind(null, item.userid)}
								>

									<i className="fa-solid fa-pen"></i>
								</Button>
								<Button
									onClick={fetchDeleteAdmin.bind(null, item.userid)}
									type={buttonClassesType.outline}
								>
									<i className="fa-regular fa-trash-can"></i>
								</Button>
							</div>
						</td>
					}
				</tr>
			)
		})
	}





	// thêm admin 
	const [fetchAddAdminStatus, setFetchAddAdminStatus] = useState(api_status.pending);
	const [keyAddAdmin, setKeyAddAdmin] = useState(0);
	const fetchAddAdmin = async (data) => {
		try {
			if (fetchAddAdminStatus === api_status.fetching) {
				setFetchAddAdminStatus(api_status.fetching)
			}

			await addAdmin(data);

			callToastSuccess(commontString.success);
			fetchGetAdmin(1);
			setKeyAddAdmin(Date.now())
			setFetchAddAdminStatus(api_status.fulfilled);

		} catch (error) {
			const mes = error?.response?.data?.message
			callToastError(mes || commontString.error);

			setFetchAddAdminStatus(api_status.rejected);
		}
	}






	// delele admin 
	const fetchDeleteAdminStatus = useRef({});
	const setFetchDeleteAdminStatus = (id, status) => {
		fetchDeleteAdminStatus.current[id] = status;
	}
	const fetchDeleteAdmin = async (id) => {
		try {
			if (fetchDeleteAdminStatus.current[id] === api_status.fetching) {
				return;
			}
			setFetchDeleteAdminStatus(id, api_status.fetching)

			await deleteAdmin({
				"userid": id
			});

			callToastSuccess(commontString.success);
			fetchGetAdmin(page);
			setFetchDeleteAdminStatus(id, api_status.fulfilled);

		} catch (error) {
			const mes = error?.response?.data?.message
			callToastError(mes || commontString.error);

			setFetchDeleteAdminStatus(id, api_status.rejected);
		}
	}





	// cập nhật admin
	const [fetchApiStatus, setFetchApiStatus] = useState(api_status.pending);
	const fetchEditAdmin = async (data) => {
		try {
			if (fetchApiStatus === api_status.fetching) {
				return;
			}
			setFetchApiStatus(api_status.fetching);
			await editAdmin(data);
			fetchGetAdmin(page)
			callToastSuccess(commontString.success);
			setFetchApiStatus(api_status.fulfilled);

		} catch (error) {
			setFetchApiStatus(api_status.rejected);
		}
	}






	// modal update permission
	const [keyEditPermistionContent, setKeyEditPermistionContent] = useState(0);
	const selectedAdmin = useRef();
	const [showModalPermision, setShowModalPermision] = useState(false);
	const openModalPermistion = (id) => {
		selectedAdmin.current = id;
		setShowModalPermision(true);
	}
	const closeModalPermistion = () => {
		if (fetchApiStatus === api_status.fetching || fetchMainDataStatus === api_status.fetching) return;
		setShowModalPermision(false);

		setKeyEditPermistionContent(Date.now());
	}





	if (currentPagePermision === adminPermision.noPermision) {
		return (
			<NoPermision />
		)
	}




	return (
		<>
			<div className={css.adminManagement}>
				<div className={css.adminManagement__header}>
					<div className={css.adminManagement__title}>Admin</div>
					<div className={`row`}>
						<div className={`col-md-12 col-6 ml-a ta-r ${css["p2p__paging"]}`}>
							<Pagination
								current={page}
								onChange={pageChangeHandle}
								total={totalItems}
								showSizeChanger={false}
							/>
						</div>
					</div>
				</div>
				{
					currentPagePermision === adminPermision.edit && <div className={`mb-2 d-flex justify-start`}>
						<AddAdmin
							key={keyAddAdmin}
							fetchAddAdmin={fetchAddAdmin}
							fetchAddAdminStatus={fetchAddAdminStatus}
						/>
					</div>
				}
				<div className={css.adminManagement__content}>
					<table>
						<thead>
							<tr>
								<th>Username</th>
								<th>Email</th>
								<th>Permision User</th>
								<th>Permistion Advertise</th>
								<th>Permistion Exchange</th>
								<th>Permistion Widthdraw</th>
								<th>Permistion Config</th>
								<th>Permistion Transfer</th>
								<th>Permistion Swap</th>
								<th>Permistion Deposite At</th>
								<th>Permistion P2p</th>
								<th>Permistion Admin</th>
								{
									currentPagePermision === adminPermision.edit && <th>
										<i className="fa-solid fa-gear"></i>
									</th>
								}
							</tr>
						</thead>
						<tbody className={isContent}>
							{renderTable(mainData)}
						</tbody>
						<tbody className={isEmpty}>
							<tr>
								<td colSpan={15}>
									<div className="spin-container">
										<Spin />
									</div>
								</td>
							</tr>
						</tbody>
						<tbody className={isFetching}>
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
			</div>
			<ModalConfirm
				title="Edit Permission"
				content={<EditPermistionContent
					key={keyEditPermistionContent}
					idUser={selectedAdmin.current}
					initialPermision={mainData?.find(item => item.userid === selectedAdmin.current) || {}}
					closeModalPermistion={closeModalPermistion}
					updateAdmin={fetchEditAdmin}
				/>}
				closeModalHandle={closeModalPermistion}
				isShowModal={showModalPermision}
				isHiddenOkButton={true}
				isHiddenCancelButton={true}
			/>
		</>
	)
}

export default AdminManagement