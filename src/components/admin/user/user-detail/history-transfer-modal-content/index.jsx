import { Pagination, Spin } from 'antd';
import css from './history-transfer-modal-content.module.scss';
import { EmptyCustom } from 'src/components/Common/Empty';
import TransferRecord from './transfer-record';
import { api_status } from 'src/constant';
import { useEffect, useRef, useState } from 'react';
import { historytransferAdmin } from 'src/util/adminCallApi';
import { useParams } from 'react-router-dom';

function HistoryTransferModalContent() {

	// lấy userid từ url
	const {
		userid
	} = useParams();
	const [id] = userid.split('_')



	// phần phân trang
	const [currentPage, setCurrentPage] = useState(1);
	const [totalItems, setTotalItems] = useState(1);
	const pageChangeHandle = (page) => {
		fetchMainData(page)
	}
	const limit = useRef(10);



	// phần main data
	const [mainData, setMainData] = useState([]);
	const [fetchStatus, setFetchStatus] = useState(api_status.pending);
	const fetchMainData = async (page) => {
		try {
			if (fetchMainData === api_status.fetching) {
				return;
			}
			setFetchStatus(api_status.fetching);
			const resp = await historytransferAdmin({
				limit: limit.current,
				page,
				query: `user_id=${id} OR receive_id=${id}`
			});
			const { array, total } = resp?.data?.data;

			setCurrentPage(page);
			setTotalItems(total);
			setMainData(array);

			setFetchStatus(api_status.fulfilled);
		} catch (error) {
			console.log(error);
			setFetchStatus(api_status.rejected);
		}
	}






	// phần render table
	const renderMainData = (mainData) => {
		return mainData?.map(record => {
			return (
				<TransferRecord content={record} />
			)
		})
	}
	const renderShowContent = () => {
		return mainData && mainData.length > 0 && fetchStatus !== api_status.fetching ? '' : '--d-none';
	}
	const renderLoading = () => {
		return fetchStatus === api_status.fetching ? '' : '--d-none';
	}
	const renderEmpty = () => {
		return (!mainData || mainData.length <= 0) && fetchStatus !== api_status.fetching ? '' : '--d-none';
	}




	// useEffect
	useEffect(() => {
		fetchMainData(1);
	}, [])


	return (
		<div className={css.historyTransferModalContent}>
			<div
				className={`
					${css.historyTransferModalContent__main}
					${renderShowContent()}
				`}>
				{renderMainData(mainData)}
			</div>
			<div className={renderEmpty()} >
				<EmptyCustom />
			</div>
			<div
				className={`
					${renderLoading()}
				`}
			>
				<Spin />
			</div>
			<div className={css.historyTransferModalContent__page}>
				<Pagination
					current={currentPage}
					onChange={pageChangeHandle}
					total={totalItems}
					showSizeChanger={false}
				/>
			</div>
		</div >
	)
}

export default HistoryTransferModalContent;