import { useContext, useEffect, useState } from 'react';
import css from '../user-detail.module.scss';
import Dropdown from 'src/components/Common/dropdown/Dropdown';
import { getAllUserWallet } from 'src/util/adminCallApi';
import { useParams } from 'react-router-dom';
import { DrillContext } from 'src/context/drill';
import { url, urlParams } from 'src/constant';



function ListWallet(props) {
	const {
		forceReload
	} = props;
	const {
		userid
	} = useParams();

	const profile = useContext(DrillContext);



	// main data
	const [mainData, setMainData] = useState([]);
	const fetchMainData = async () => {
		try {
			const resp = await getAllUserWallet({
				userid: userid
			});
			setMainData(resp?.data?.data);
			setSelectedId(+userid);
		} catch (error) {

		}
	}






	// phần dropdown
	const selectedItem = {
		id: profile?.id,
		content: profile?.username
	}
	const renderOption = (list) => {
		return list?.map(item => {
			return (
				{
					id: item.id,
					content: item.username
				}
			)
		})
	}
	const itemDropdownClickHandle = (item) => {
		forceReload(item)
	}





	// useEffect
	useEffect(() => {
		fetchMainData();
	}, [])




	return (
		<div className={css.userDetail__listWallet}>
			<div style={{ overflow: 'visible' }} className={css['userDetail--box']}>
				<div className={css['userDetail--title']}>
					Wallet
				</div>
				<div className={css.userDetail__listWallet__dropdownContainer}>
					<Dropdown
						id={`dropdownListCoin`}
						list={renderOption(mainData)}
						itemClickHandle={itemDropdownClickHandle}
						itemSelected={selectedItem}
					/>
				</div>
			</div>
		</div>
	)
}

export default ListWallet