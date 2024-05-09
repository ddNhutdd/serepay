import { useContext, useEffect, useState } from 'react';
import css from '../user-detail.module.scss';
import Dropdown from 'src/components/Common/dropdown/Dropdown';
import { getAllUserWallet } from 'src/util/adminCallApi';
import { useParams } from 'react-router-dom';
import { DrillContext } from 'src/context/drill';
import { callToastError } from 'src/function/toast/callToast';
import { commontString } from 'src/constant';



function ListWallet(props) {
	const {
		forceReload
	} = props;
	const {
		userid
	} = useParams();

	const [profile, renderTitle] = useContext(DrillContext);



	// main data
	const [mainData, setMainData] = useState([]);
	const fetchMainData = async () => {
		try {
			const resp = await getAllUserWallet({
				userid: userid
			});
			setMainData(resp?.data?.data);
		} catch (error) {
			const mess = error?.response?.data?.message;
			callToastError(mess || commontString.error);
		}
	}






	// phần dropdown
	const renderItemContent = (item) => {
		if (item?.nickName) {
			return (
				<span>
					{item.nickName}
					{" "}
					{<span style={{ opacity: 0.5 }}>
						({item?.username})
					</span>}
				</span>
			)
		} else {
			return (
				<span>
					{item?.username}
				</span>
			)
		}
	}
	const renderOption = (list) => {
		return list?.map(item => {
			return (
				{
					id: item.id,
					content: renderItemContent(item)
				}
			)
		})
	}
	const itemDropdownClickHandle = (item) => {
		forceReload(item)
	}
	const selectedItem = {
		id: profile?.id,
		content: renderItemContent(profile)
	}









	// useEffect
	useEffect(() => {
		fetchMainData();
	}, [])




	return (
		<div className={css.userDetail__listWallet}>
			<div style={{ overflow: 'visible' }} className={css['userDetail--box']}>
				<div className={css['userDetail--title']}>
					Wallet {renderTitle(profile)}
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