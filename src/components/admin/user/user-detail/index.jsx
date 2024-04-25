import { useParams } from 'react-router-dom';
import css from './user-detail.module.scss';
function UserDetail() {
	const {
		userid
	} = useParams();
	const [id, name, email] = userid.split('_')

	return (
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
					<div className={`${css.userDetail__cell} ${css.header}`}>
						Email:
					</div>
					<div className={`${css.userDetail__cell}`}>
						{email}
					</div>
				</div>
			</div>
			<div className={css.userDetail__changeCoint}></div>
		</div>
	)
}

export default UserDetail