import { useParams } from 'react-router-dom';
import css from './user-detail.module.scss';
import { Button } from 'src/components/Common/Button';
import socket from 'src/util/socket';
import { useEffect, useState } from 'react';
import { getWalletToUserAdmin } from 'src/util/adminCallApi';
import { ModalConfirm } from 'src/components/Common/ModalConfirm';
import EditCoinModalContent from './edit-coin-modal-content';
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




	// user wallet 
	const [userWallet, setUserWallet] = useState([]);
	const fetchUserWallet = async () => {
		const resp = await getWalletToUserAdmin({
			userid: id
		});
		setUserWallet(resp?.data?.data);
	}


	// modal change wallet
	const [editWalletModalShow, setEditWalletModalShow] = useState(false);
	const editWalletModalShowOpen = () => {
		setEditWalletModalShow(true);
	}
	const editWalletModalShowClose = () => {
		setEditWalletModalShow(false);
	}


	useEffect(() => {
		fetchAllCoin();
		fetchUserWallet();
	}, [])




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
							{email}
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
							{email}
						</div>
					</div>
				</div>
				<div className={`${css.userDetail__changeCoin} mt-2`}>
					{
						allCoin && userWallet && <Button
							onClick={editWalletModalShowOpen}
						>
							Edit Wallet
						</Button>
					}

				</div>
			</div>
			<ModalConfirm
				title={name}
				content={<EditCoinModalContent allCoin={allCoin} userCoin={userWallet} id={id} />}
				isHiddenOkButton={true}
				waiting={false}
				isShowModal={editWalletModalShow}
				closeModalHandle={editWalletModalShowClose}
			/>
		</>
	)
}

export default UserDetail