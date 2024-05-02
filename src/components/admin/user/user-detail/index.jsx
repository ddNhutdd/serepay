import { useParams } from 'react-router-dom';
import css from './user-detail.module.scss';
import socket from 'src/util/socket';
import { useEffect, useState } from 'react';
import { getWalletToUserAdmin } from 'src/util/adminCallApi';

import CoinRecord from './coin-record';
import { Pagination, Spin } from 'antd';
import { api_status, image_domain } from 'src/constant';
import CopyButton from 'src/components/Common/copy-button';
import { EmptyCustom } from 'src/components/Common/Empty';
import { Button, buttonClassesType } from 'src/components/Common/Button';
import { TagCustom, TagType } from 'src/components/Common/Tag';
import { ModalConfirm } from 'src/components/Common/ModalConfirm';
import { Input } from 'src/components/Common/Input';
function UserDetail() {
	const {
		userid
	} = useParams();
	const [id, name, email] = userid.split('_')





	// get all coin
	const [allCoin, setAllCoin] = useState([]);
	const fetchAllCoin = () => {
		socket.once('listCoin', resp => {
			setAllCoin(resp);
		})
	}




	// user wallet, nhiều ví liên quan
	const [listUser, setListUser] = useState([]);
	const [fetchListUserStatus, setFetchListUserStatus] = useState(api_status.fetching);
	const [userWallet, setUserWallet] = useState([]);
	const fetchUserWallet = async () => {
		const resp = await getWalletToUserAdmin({
			userid: id
		});
		setUserWallet(resp?.data?.data);
	}
	const renderSpinListUser = () => {
		return fetchListUserStatus === api_status.fetching ? '' : '--d-none';
	}





	//  phần transfer history








	// phần withdraw history







	// modal confirm cho withdraw






	// modal reject cho withdraw





	const fetchUserCoin = async () => {
		try {
			if (fetchListUserStatus === api_status.fetching) return;
			setFetchListUserStatus(api_status.fetching);
			const resp = Promise.all([fetchAllCoin, ]);


			setFetchListUserStatus(api_status.fulfilled);
		} catch (error) {
			console.log(error);
			setFetchListUserStatus(api_status.rejected);
		}
	}
	useEffect(() => {

		fetchUserCoin();

	}, [])




	// nếu email không phải là chuỗi null thì render email lên giao diện
	const renderEmail = () => {
		return email !== 'null' ? email : '_';
	}


	return (
		<>
			<div className={css.userDetail}>
				<div className={css.userDetail__image}>
					<div className={css.userDetail__image__left}>
						<i className="fa-solid fa-circle-user"></i>
					</div>

					<div className={css.userDetail__image__right}>
						<div className={css.userDetail__image__right__name}>
							{name}
						</div>
						<div className={css.userDetail__image__right__email}>
							{renderEmail()}
						</div>
					</div>
				</div>
				<div className={css.userDetail__table}>
					<div className={css.userDetail__record}>
						<div className={`${css.userDetail__cell} ${css.header}`}>
							Username:
						</div>
						<div className={`${css.userDetail__cell}`}>
							{name}
						</div>
					</div>
					<div className={css.userDetail__record}>
						<div className={`${css.userDetail__cell} ${css.header} bb-0`}>
							Email:
						</div>
						<div className={`${css.userDetail__cell} bb-0`}>
							{renderEmail()}
						</div>
					</div>
				</div>
				<div className={css[`userDetail--box`]}>
					<div className={css.userDetail__wallet}>
						<div className={css[`userDetail--title`]}>
							Wallet - <span>nickname (userName)</span>
						</div>
						<div className={css.userDetail__walletContent}>
							<div className={css.userDetail__walletContent__row}>
								<CoinRecord
									id={`1`}
									coinAmount={`123`}
									coinName={`BTC`}
								/>
							</div>
							<div className={css.userDetail__walletContent__row}>
								<CoinRecord
									id={`1`}
									coinAmount={`123`}
									coinName={`USDT`}
								/>
							</div>
							<div className={css.userDetail__walletContent__row}>
								<CoinRecord
									id={`1`}
									coinAmount={`123`}
									coinName={`BNB`}
								/>
							</div>
							<div className={css.userDetail__walletContent__row}>
								<CoinRecord
									id={`1`}
									coinAmount={`123`}
									coinName={`BTC`}
								/>
							</div>
							<div className={css.userDetail__walletContent__row}>
								<CoinRecord
									id={`1`}
									coinAmount={`123`}
									coinName={`USDT`}
								/>
							</div>
						</div>
					</div>
				</div>
				<div className={`spin-container ${renderSpinListUser()}`}>
					<Spin />
				</div>
				<div className={css[`userDetail--box`]}>
					<div className={css.userDetail__sectionTable}>
						<div className='d-flex alignItem-c justify-sb mb-2 f-lg-c'>
							<div className={css[`userDetail--title`]}>
								Transfer History
							</div>
							<Pagination
								showSizeChanger={false}
								current={1}
								onChange={() => { }}
								total={100}
							/>
						</div>
						<div className={css[`userDetail--tableContainer`]}>
							<table>
								<thead>
									<tr>
										<th>Create At</th>
										<th>Amount</th>
										<th>Address From</th>
										<th>Amount Before From</th>
										<th>Amount After From</th>
										<th>Address To</th>
										<th>Amount Before To</th>
										<th>Amount After To</th>
										<th>Create At</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>2/5/2024 13:57:52</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<img src={image_domain} alt="usdt" />
												12
											</div>
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<div style={{ whiteSpace: 'nowrap' }}>
													Hoài Thương
												</div>
												<CopyButton
													value={`fdasfdsa`}
												/>
											</div>
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<img src={image_domain} alt="usdt" />
												2,102.97
											</div>
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<img src={image_domain} alt="usdt" />
												2,102.97
											</div>
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<div style={{ whiteSpace: 'nowrap' }}>
													Hoài Thương
												</div>
												<CopyButton
													value={`fdasfdsa`}
												/>
											</div>
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<img src={image_domain} alt="usdt" />
												2,102.97
											</div>
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<img src={image_domain} alt="usdt" />
												2,102.97
											</div>
										</td>
										<td>
											ok nha
										</td>
									</tr>
								</tbody>
								<tbody>
									<tr>
										<td colSpan={9}>
											<div className='spin-container'>
												<Spin></Spin>
											</div>
										</td>
									</tr>
								</tbody>
								<tbody>
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
					<div className='spin-container'>
						<Spin />
					</div>
				</div>
				<div className={css[`userDetail--box`]}>
					<div className={css.userDetail__sectionTable}>
						<div className='d-flex alignItem-c justify-sb mb-2 f-lg-c'>
							<div className={css[`userDetail--title`]}>
								Withdraw History
							</div>
							<Pagination
								showSizeChanger={false}
								current={1}
								onChange={() => { }}
								total={100}
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
										<th>
											<i className="fa-solid fa-gears"></i>
										</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<img src={image_domain} alt="usdt" />
												12
											</div>
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<div style={{ whiteSpace: 'nowrap' }}>
													Hoài Thương
												</div>
												<CopyButton
													value={`fdasfdsa`}
												/>
											</div>
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<img src={image_domain} alt="usdt" />
												12
											</div>
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<img src={image_domain} alt="usdt" />
												12
											</div>
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<div style={{ whiteSpace: 'nowrap' }}>
													Hoài Thương
												</div>
												<CopyButton
													value={`fdasfdsa`}
												/>
											</div>
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<img src={image_domain} alt="usdt" />
												12
											</div>
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<img src={image_domain} alt="usdt" />
												12
											</div>
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<div style={{ whiteSpace: 'nowrap' }}>
													Hoài Thương
												</div>
												<CopyButton
													value={`fdasfdsa`}
												/>
											</div>
										</td>
										<td>
											2/5/2024 13:54:27
										</td>
										<td>
											info
										</td>
										<td>
											<TagCustom type={TagType.error} />
										</td>
										<td>
											<div className='d-flex alignItem-c gap-1'>
												<Button>Confirm</Button>
												<Button type={buttonClassesType.outline}>Reject</Button>
											</div>
										</td>
									</tr>
								</tbody>
								<tbody>
									<tr>
										<td colSpan={12}>
											<div className='spin-container'>
												<Spin></Spin>
											</div>
										</td>
									</tr>
								</tbody>
								<tbody>
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
					<div className='spin-container'>
						<Spin />
					</div>
				</div>
			</div>
			<ModalConfirm
				title="Confirm Transfer"
				content="Are you sure ?"
				modalConfirmHandle={() => { }}
				waiting={false}
				closeModalHandle={() => { }}
				isShowModal={false}
			/>
			<ModalConfirm
				title="Reject Transfer"
				content={(
					<>
						<label htmlFor="rejectTransferInputId">
							Reason
						</label>
						<Input id={`rejectTransferInputId`} />
					</>
				)}
				modalConfirmHandle={() => { }}
				waiting={false}
				closeModalHandle={() => { }}
				isShowModal={false}
			/>
		</>
	)
}

export default UserDetail