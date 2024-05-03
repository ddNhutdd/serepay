import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api_status } from "src/constant";
import { getAllUserWallet, getWalletToUserAdmin } from "src/util/adminCallApi";
import { deepCopyObject, formatNumber } from "src/util/common";
import CoinRecord from "./coin-record";
import { Spin } from "antd";
import css from "../user-detail.module.scss"
import socket from "src/util/socket";
import { availableLanguage } from "src/translation/i18n";

function UserWallet(props) {
	const {
		userid
	} = useParams();
	const [id, name, email] = userid.split('_')



	// user wallet, nhiều ví liên quan
	const [allUserWallet, setAllUserWallet] = useState({});
	const allUserName = useRef({});
	const [fetchListUserStatus, setFetchListUserStatus] = useState(api_status.pending);

	const fetchUserWallet = async (userid) => {
		const resp = await getWalletToUserAdmin({
			userid
		});
		setAllUserWallet(state => {
			const newState = deepCopyObject(state);
			newState[userid] = resp?.data?.data;
			return newState;
		})
	}
	const renderSpinListUser = () => {
		return fetchListUserStatus === api_status.fetching ? '' : '--d-none';
	}
	const fetchAllUserWallet = async () => {
		try {
			const resp = await getAllUserWallet({
				userid: id
			});
			const data = [{ id: +id, username: name }, ...resp?.data?.data];
			allUserName.current = data;
			data.forEach(async (item) => {
				const id = item.id;
				await fetchUserWallet(id);
			})

		} catch (error) {
		}
	}
	const renderListUserWallet = (listUserWallet, listUserName, listCoin) => {
		const result = [];
		for (const [key, value] of Object.entries(listUserWallet)) {
			const user = listUserName?.find(item => {
				return item.id === +key;
			});
			result.push(
				<div key={key} className={css[`userDetail--box`]}>
					<div className={css.userDetail__wallet}>
						<div className={css[`userDetail--title`]}>
							Wallet - {user?.username}
						</div>
						<div className={css.userDetail__walletContent}>
							{
								listCoin?.map(coin => {
									const coinWallet = coin?.name?.toLowerCase() + '_balance';
									const coinAmount = formatNumber((+value[coinWallet]) || 0, availableLanguage.en, 8);
									return (
										<div key={coin.id} className={css.userDetail__walletContent__row}>
											<CoinRecord
												id={key}
												coinAmount={coinAmount}
												coinName={coin.name}
											/>
										</div>
									)
								})
							}
						</div>
					</div>
				</div>
			)
		}
		return result;
	}


	// get all coin
	const allCoin = useRef([]);
	const fetchAllCoin = () => {
		return new Promise(resolve => {
			socket.once('listCoin', resp => {
				allCoin.current = resp;
				resolve(resp)
			})
		});
	}



	// phần useEffect
	const fetchUserCoin = async () => {
		try {
			if (fetchListUserStatus === api_status.fetching) return;
			setFetchListUserStatus(api_status.fetching);
			await Promise.all([fetchAllCoin(), fetchAllUserWallet()]);

			setFetchListUserStatus(api_status.fulfilled);
		} catch (error) {
			setFetchListUserStatus(api_status.rejected);
		}
	}
	useEffect(() => {
		fetchUserCoin();
	}, [])


	return (
		<>
			{renderListUserWallet(allUserWallet, allUserName.current, allCoin.current)}
			<div className={`spin-container ${renderSpinListUser()}`}>
				<Spin />
			</div>
		</>
	)
}

export default UserWallet