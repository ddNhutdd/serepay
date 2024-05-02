import { useParams } from 'react-router-dom';
import css from './user-detail.module.scss';
import { Button } from 'src/components/Common/Button';
import socket from 'src/util/socket';
import { useEffect, useState } from 'react';
import { getWalletToUserAdmin } from 'src/util/adminCallApi';
import { ModalConfirm } from 'src/components/Common/ModalConfirm';
import EditCoinModalContent from './edit-coin-modal-content';
import HistoryTransferModalContent from './history-transfer-modal-content';
import HistoryWidthdrawModalContent from './history-widthdraw-modal-content';
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




	// modal history transfer
	const historyTransferString = 'History Transfer';
	const [historyTransferModalShow, setHistoryTransferModalShow] = useState(false);
	const historyTransferModalOpen = () => {
		setHistoryTransferModalShow(true);
	}
	const historyTransferModalClose = () => {
		setHistoryTransferModalShow(false);
	}




	// modal history widthdraw
	const historyWidthdrawString = 'History Widthdraw';
	const [historyWidthdrawModalShow, setHistoryWidthdrawModalShow] = useState(false);
	const historyWidthdrawModalOpen = () => {
		setHistoryWidthdrawModalShow(true);
	}
	const historyWidthdrawModalClose = () => {
		setHistoryWidthdrawModalShow(false);
	}





	useEffect(() => {
		fetchAllCoin();
		fetchUserWallet();
	}, [])
	useEffect(() => {
		if (editWalletModalShow === true) {
			fetchUserWallet();
		}
	}, [editWalletModalShow])




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
				<div className={`${css.userDetail__more}`}>
					{
						allCoin && userWallet && <Button
							onClick={editWalletModalShowOpen}
						>
							Edit Wallet
						</Button>
					}
					<Button
						onClick={historyTransferModalOpen}
					>
						{historyTransferString}
					</Button>
					<Button
						onClick={historyWidthdrawModalOpen}
					>
						History Widthdraw
					</Button>
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
			{
				historyTransferModalShow && <ModalConfirm
					title={historyTransferString}
					content={<HistoryTransferModalContent />}
					isHiddenOkButton={true}
					waiting={false}
					isShowModal={historyTransferModalShow}
					closeModalHandle={historyTransferModalClose}
				/>
			}
			{
				historyWidthdrawModalShow && <ModalConfirm
					title={historyWidthdrawString}
					content={<HistoryWidthdrawModalContent />}
					isHiddenOkButton={true}
					waiting={false}
					isShowModal={historyWidthdrawModalShow}
					closeModalHandle={historyWidthdrawModalClose}
				/>
			}
		</>
	)
}

export default UserDetail