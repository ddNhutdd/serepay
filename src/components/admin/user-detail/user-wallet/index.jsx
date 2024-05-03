import { useState, useRef, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { api_status } from "src/constant";
import { getWalletToUserAdmin } from "src/util/adminCallApi";
import { formatNumber } from "src/util/common";
import CoinRecord from "./coin-record";
import { Spin } from "antd";
import css from "../user-detail.module.scss"
import socket from "src/util/socket";
import { availableLanguage } from "src/translation/i18n";
import { DrillContext } from "src/context/drill";

function UserWallet(props) {
	const {
		userid
	} = useParams();
	const profile = useContext(DrillContext);




	// user wallet
	const [userWallet, setUserWallet] = useState({});
	const [fetchWalletStatus, setFetchWalletStatus] = useState(api_status.pending);
	const fetchUserWallet = async () => {
		try {
			const resp = await getWalletToUserAdmin({
				userid: userid
			});
			setUserWallet(resp?.data?.data)
		} catch (error) {
		}
	}


	// render main content
	const renderSpinWalletUser = () => {
		return fetchWalletStatus === api_status.fetching ? '' : '--d-none';
	}
	const renderWallet = (listCoin, wallet) => {
		return listCoin?.map(coin => {
			const coinWallet = coin?.name?.toLowerCase() + '_balance';
			const coinAmount = formatNumber((+wallet[coinWallet]) || 0, availableLanguage.en, 8);
			return (
				<div key={coin.id} className={css.userDetail__walletContent__row}>
					<CoinRecord
						id={userid}
						coinAmount={coinAmount}
						coinName={coin.name}
					/>
				</div>
			)
		})
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
			if (fetchWalletStatus === api_status.fetching) return;
			setFetchWalletStatus(api_status.fetching);

			await Promise.all([fetchAllCoin(), fetchUserWallet()]);

			setFetchWalletStatus(api_status.fulfilled);
		} catch (error) {
			setFetchWalletStatus(api_status.rejected);
		}
	}
	useEffect(() => {
		fetchUserCoin();
	}, [])


	return (
		<div className={css[`userDetail--box`]}>
			<div className={css.userDetail__wallet}>
				<div className={css[`userDetail--title`]}>
					Wallet - {profile.username}
				</div>
				<div className={css.userDetail__walletContent}>
					{renderWallet(allCoin.current, userWallet)}
				</div>
			</div>
			<div className={`spin-container ${renderSpinWalletUser()}`}>
				<Spin />
			</div>
		</div>
	)
}

export default UserWallet