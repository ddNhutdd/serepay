import { useParams } from 'react-router-dom';
import css from './user-detail.module.scss';
import UserWallet from './user-wallet';
import TransferHistory from './transfer-history';
import WithdrawHistory from './withdraw-history';
import { useEffect, useState } from 'react';
import ListWallet from './list-wallet';
import { getUserToId } from 'src/util/adminCallApi';
import { DrillContext } from 'src/context/drill';
import { useHistory, useLocation } from "react-router-dom";
import { adminPermision, url, urlParams } from 'src/constant';
import { adminFunction } from '../sidebar';
import { getAdminPermision } from 'src/redux/reducers/admin-permision.slice';
import { analysisAdminPermision } from 'src/util/common';
import { useSelector } from 'react-redux';
import NoPermision from '../no-permision';
import socket from 'src/util/socket';
import { callToastError } from 'src/function/toast/callToast';



function UserDetail() {
	const {
		userid
	} = useParams();
	let history = useHistory();
	const location = useLocation();






	// fetch list coin
	const [listCoin, setListCoin] = useState();
	const fetchListCoin = () => {
		return new Promise((resolve, reject) => {
			try {
				socket.once('listCoin', resp => {
					setListCoin(resp)
					resolve(resp)
				})
			} catch (error) {
				reject(`error`);
			}
		})
	}





	// phần kiểm tra quyền của admin
	const { permision } = useSelector(getAdminPermision);
	const currentPagePermision = analysisAdminPermision(adminFunction.user, permision);








	// force reload 
	const [key, setKey] = useState(userid);
	const forceReload = (item) => {
		history.push(url.admin_userDetail.replace(urlParams.userId, item.id));
		fetchUserDetail(item.id);
		setKey(item.id);
	}
	useEffect(() => {
		const newId = location?.pathname?.split('/')?.at(-1);
		setKey(newId)
		fetchUserDetail(newId);
	}, [location])








	// lấy thông tin của user hiện tại
	const [userInfo, setUserInfo] = useState({});
	const fetchUserDetail = async (userId) => {
		try {
			setUserInfo({})
			const resp = await getUserToId({
				userid: userId
			});
			setUserInfo(resp?.data?.data?.at(0))
		} catch (error) {
			const mess = error?.response?.data?.message;
			callToastError(mess || commontString.error);
		}
	}






	// nếu email có ý nghĩa thì render nó lên
	const renderEmail = (email) => {
		switch (email) {
			case null:
			case undefined:
			case 'null':
				return '--';

			default:
				return email;
		}
	}







	// nếu nickname có ý nghĩa thì render nó lên
	const renderNickname = (nickName) => {
		switch (nickName) {
			case null:
			case undefined:
			case 'null':
				return '--';

			default:
				return nickName;
		}
	}





	// hàm để truyền xuống context, hàm render title
	const renderTitle = (profile) => {
		if (profile?.nickName) {
			return (
				<span className={css[`userDetail--nickname`]}>
					{`- ${profile.nickName}`}
					{" "}
					<span className={css[`userDetail--username`]}>
						({`${profile.username}`})
					</span>
				</span>
			)
		} else {
			return (
				<span className={css[`userDetail--nickname`]}> {`- ${profile.username}`}</ span>
			)
		}
	}









	// useEffect
	useEffect(() => {
		fetchUserDetail(userid);
		fetchListCoin();
	}, [])






	if (currentPagePermision === adminPermision.noPermision) {
		return (
			<NoPermision />
		)
	}





	return (
		<div key={key} className={css.userDetail}>
			<div className={css.userDetail__image}>
				<div className={css.userDetail__image__left}>
					<i className="fa-solid fa-circle-user"></i>
				</div>

				<div className={css.userDetail__image__right}>
					<div className={css.userDetail__image__right__name}>
						{userInfo?.username}
					</div>
					<div className={css.userDetail__image__right__email}>
						{renderEmail(userInfo?.email)}
					</div>
				</div>
			</div>
			<div className={css.userDetail__table}>
				<div className={css.userDetail__record}>
					<div className={`${css.userDetail__cell} ${css.header}`}>
						User name:
					</div>
					<div className={`${css.userDetail__cell}`}>
						{userInfo?.username}
					</div>
				</div>
				<div className={css.userDetail__record}>
					<div className={`${css.userDetail__cell} ${css.header}`}>
						Nick name:
					</div>
					<div className={`${css.userDetail__cell}`}>
						{renderNickname(userInfo?.nickName)}
					</div>
				</div>
				<div className={css.userDetail__record}>
					<div className={`${css.userDetail__cell} ${css.header} bb-0`}>
						Email:
					</div>
					<div className={`${css.userDetail__cell} bb-0`}>
						{renderEmail(userInfo?.email)}
					</div>
				</div>
			</div>
			<DrillContext.Provider value={[userInfo, renderTitle, listCoin]}>
				<ListWallet forceReload={forceReload} />
				<UserWallet />
				<TransferHistory />
				<WithdrawHistory />
			</DrillContext.Provider>
		</div>
	)
}

export default UserDetail