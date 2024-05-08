import Dropdown from 'src/components/Common/dropdown/Dropdown'
import css from './edit-permision-content.module.scss'
import listPermision from './list.js';
import { adminFunction } from '../../sidebar';
import { Button, buttonClassesType } from 'src/components/Common/Button';
import { useEffect, useState } from 'react';
import { analysisAdminPermision, capitalizeFirstLetter } from 'src/util/common';
import { adminPermision, api_status, commontString } from 'src/constant';
import list from './list.js';
import list2 from './list-2';


function EditPermistionContent(props) {
	const {
		idUser,
		initialPermision,
		closeModalPermistion,
		updateAdmin
	} = props;


	// lưu trữ thông tin permision
	const [permisionState, setPermisionState] = useState(initialPermision);







	// lưu thông tin
	const saveClickHandle = async () => {
		await updateAdmin(permisionState);
		closeModalPermistion();
	}






	// dropdown select
	function dropdownItemClickHandle(seletecItem) {
		const permision = this;
		let newPer = {};
		switch (seletecItem.id) {
			case adminPermision.edit:
				newPer = {
					[`edit` + capitalizeFirstLetter(permision)]: 1,
					[permision]: 1
				}
				break;
			case adminPermision.watch:
				newPer = {
					[`edit` + capitalizeFirstLetter(permision)]: 0,
					[permision]: 1
				}
				break;
			case adminPermision.noPermision:
				newPer = {
					[`edit` + capitalizeFirstLetter(permision)]: 0,
					[permision]: 0
				}
				break;
			default:
				break;
		}

		setPermisionState(prevState => {
			return {
				...prevState,
				...newPer
			}
		})
	}




	//render Selected Item 
	const renderSelectedItem = (key) => {
		const per = analysisAdminPermision(key, permisionState);
		switch (per) {
			case adminPermision.noPermision:
				return listPermision?.at(0)
			case adminPermision.edit:
				return listPermision?.at(2)
			case adminPermision.watch:
				return listPermision?.at(1)
			default:
				break;
		}
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
								list={
									key === adminFunction.swap ||
										key === adminFunction.deposit ||
										key === adminFunction.transfer ?
										list2 :
										list
								}
								itemClickHandle={dropdownItemClickHandle.bind(key)}
								itemSelected={renderSelectedItem(key)}
								id={idUser + key}
							/>
						</div>
					)
				})
			}
			<div className={css.editPermistionContent__action}>
				<Button onClick={saveClickHandle}>
					Save
				</Button>
				<Button
					type={buttonClassesType.outline}
					onClick={closeModalPermistion}
				>
					Cancel
				</Button>
			</div>
		</div>
	)
}

export default EditPermistionContent