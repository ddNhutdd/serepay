import { Pagination, Spin } from 'antd';
import css from '../user-detail.module.scss';
import { api_status, image_domain, url, urlParams } from 'src/constant';
import { EmptyCustom } from 'src/components/Common/Empty';
import CopyButton from 'src/components/Common/copy-button';
import { useParams } from 'react-router-dom';
import { useContext, useEffect, useRef, useState } from 'react';
import { historytransferAdmin } from 'src/util/adminCallApi';
import { formatNumber, rountRange, shortenHash } from 'src/util/common';
import { availableLanguage } from 'src/translation/i18n';
import { DrillContext } from 'src/context/drill';
import { NavLink } from 'react-router-dom';
import { callToastError } from 'src/function/toast/callToast';

function TransferHistory() {
	const {
		userid: id
	} = useParams();
	const [profile, renderTitle, listCoin] = useContext(DrillContext);







	// phần phân trang
	const limit = useRef(10)
	const [page, setPage] = useState(1);
	const [totalItems, setTotalItems] = useState(1);
	const pageChangeHandle = (page) => {
		fetchMainData(page)
	}






	// call api fetch data
	const [mainData, setMainData] = useState([]);
	const [fetchApiStatus, setFetchApiStatus] = useState(api_status.pending);
	const fetchMainData = async (page) => {
		try {
			if (fetchApiStatus === api_status.fetching) {
				return;
			}
			setFetchApiStatus(api_status.fetching);
			const resp = await historytransferAdmin({
				limit: limit.current,
				page,
				query: `user_id=${id} OR receive_id=${id}`
			});
			const { array, total } = resp?.data?.data;

			setPage(page);
			setTotalItems(total);
			setMainData(array);

			setFetchApiStatus(api_status.fulfilled);
		} catch (error) {
			setFetchApiStatus(api_status.rejected);
		}
	}








	// render table
	const classFetching = fetchApiStatus === api_status.fetching ? '' : '--d-none';
	const classEmpty = fetchApiStatus !== api_status.fetching && (!mainData || mainData?.length <= 0) ? '' : '--d-none';
	const classContent = fetchApiStatus !== api_status.fetching && mainData && mainData?.length > 0 ? '' : '--d-none';
	const renderTable = (list) => {
		return (
			list?.map(item => {
				return (
					<tr key={item.id}>
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
							<div className='d-flex alignItem-c gap-1'>
								<div style={{ whiteSpace: 'nowrap' }}>
									<NavLink className={`--link`} to={url.admin_userDetail.replace(urlParams.userId, item.user_id)}>
										{shortenHash(item?.address_form)}
									</NavLink>
								</div>
								<CopyButton
									value={item?.address_form}
								/>
							</div>
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
									<NavLink className={`--link`} to={url.admin_userDetail.replace(urlParams.userId, item.receive_id)}>
										{shortenHash(item?.address_to)}
									</NavLink>
								</div>
								<CopyButton
									value={item?.address_to}
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
						<td>{item?.created_at}</td>
						<td>
							{item?.note}
						</td>
					</tr>
				)
			})
		)
	}






	// useEffect 
	useEffect(() => {
		fetchMainData(1);
	}, [])







	return (
		<div className={css[`userDetail--box`]}>
			<div className={css.userDetail__sectionTable}>
				<div className='d-flex alignItem-c justify-sb mb-2 f-lg-c'>
					<div className={css[`userDetail--title`]}>
						Transfer History {renderTitle(profile)}
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
								<th>Address From</th>
								<th>Amount Before From</th>
								<th>Amount After From</th>
								<th>Address To</th>
								<th>Amount Before To</th>
								<th>Amount After To</th>
								<th>Create At</th>
								<th>Note</th>
							</tr>
						</thead>
						<tbody className={classContent}>
							{renderTable(mainData)}
						</tbody>
						<tbody className={classFetching}>
							<tr>
								<td colSpan={9}>
									<div className='spin-container'>
										<Spin />
									</div>
								</td>
							</tr>
						</tbody>
						<tbody className={classEmpty}>
							<tr>
								<td colSpan={9}>
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
	)
}

export default TransferHistory