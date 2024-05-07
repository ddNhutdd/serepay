import Dropdown from 'src/components/Common/dropdown/Dropdown'
import css from './edit-permision-content.module.scss'
import listPermision from './list.js';
import { adminFunction } from '../../sidebar';
import { Button, buttonClassesType } from 'src/components/Common/Button';
import { useState } from 'react';

function EditPermistionContent(props) {
	const {
		idUser,
		closeModal, 
		permision
	} = props;
	console.log(permision)


	const saveClickHandle = () => {

	}



	// lưu trữ dữ liệu 
	const [value, setValue] = useState({});






	function dropdownItemClickHandle(idUser) {
		console.log(this)
		console.log(idUser)
	}




	//render Selected Item 
	const renderSelectedItem = (key) => {
		console.log(key)
	}






	return (
		<div className={css.editPermistionContent}>
			{
				Object.entries(adminFunction)?.map(([key, value]) => {
					return (
						<div key={key} className={css.editPermistionContent__row}>
							<label>
								{value}
							</label>
							<Dropdown
								list={listPermision}
								itemClickHandle={dropdownItemClickHandle.bind(key)}
								itemSelected={renderSelectedItem(key)}
								id={idUser + key}
							/>
						</div>
					)
				})
			}
			<div className={css.action}>
				<Button onClick={saveClickHandle}>
					Save
				</Button>
				<Button
					type={buttonClassesType.outline}
					onClick={closeModal}
				>
					Cancel
				</Button>
			</div>
		</div>
	)
}

export default EditPermistionContent