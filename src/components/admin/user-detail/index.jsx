import { useParams } from 'react-router-dom';
import css from './user-detail.module.scss';
import UserWallet from './user-wallet';
import TransferHistory from './transfer-history';
import WithdrawHistory from './withdraw-history';
import { Drill } from 'src/context/drill';
function UserDetail() {
	const {
		userid
	} = useParams();
	const [id, name, email] = userid.split('_')


	// nếu email không phải là chuỗi null thì render email lên giao diện
	const renderEmail = () => {
		return email !== 'null' ? email : '_';
	}



	// lấy thông tin của user hiện tại
	const [userInfo, setUserInfo] = useState();







	// useEffect
	useEffect(() => {
		// lấy thông tin user theo id
		
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
				<Drill.Provider value={userInfo}>
					<UserWallet />
					<TransferHistory />
					<WithdrawHistory />
				</Drill.Provider>
			</div>

		</>
	)
}

export default UserDetail