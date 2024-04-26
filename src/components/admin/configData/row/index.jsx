import React, { useState } from 'react'
import { Button, buttonClassesType } from 'src/components/Common/Button';
import { Input } from 'src/components/Common/Input';
import { api_status, commontString } from 'src/constant';
import { callToastSuccess } from 'src/function/toast/callToast';
import { updateConfigAdmin } from 'src/util/adminCallApi';

function Row(props) {
	const {
		name,
		note,
	} = props;


	// const 
	const [noteInner, setNoteInner] = useState(note);



	// trạng thái edit 
	const [editStatus, setEditStatus] = useState(false);
	const renderClassEditStatus = (value) => {
		return value ? '' : '--d-none';
	}




	// save click
	const [fetchApiStatus, setFetApiStatus] = useState(api_status.pending);
	const saveClickHandle = async () => {
		try {
			if (fetchApiStatus === api_status.fetching) {
				return;
			}
			setFetApiStatus(api_status.fetching)
			await updateConfigAdmin({
				name,
				note: inputValue
			});
			setNoteInner(inputValue);
			callToastSuccess(commontString.success);
			setEditStatus(false);
			setFetApiStatus(api_status.fulfilled)

		} catch (error) {
			setFetApiStatus(api_status.rejected)
		}
	}




	// input
	const [inputValue, setInputValue] = useState(note);
	const inputValueChangeHandle = (ev) => {
		setInputValue(ev.target.value)
	}




	// edit click handle 
	const editClickHandle = () => {
		setEditStatus(true);
		setInputValue(noteInner);
	}




	return (
		<tr>
			<td>
				{name}

			</td>
			<td>
				<Input
					value={inputValue}
					onChange={inputValueChangeHandle}
					className={renderClassEditStatus(editStatus)}
				/>
				<div className={renderClassEditStatus(!editStatus)}>
					{noteInner}
				</div>
			</td>
			<td>
				<div className='d-flex alignItem-c gap-1'>
					<Button
						style={{ width: 47 }}
						className={renderClassEditStatus(!editStatus)}
						onClick={editClickHandle}
					>
						<i className="fa-solid fa-pen"></i>
					</Button>
					<Button
						loading={fetchApiStatus === api_status.fetching}
						style={{ width: 90 }}
						className={renderClassEditStatus(editStatus)}
						onClick={saveClickHandle}
					>
						Save
					</Button>
					<Button
						disabled={fetchApiStatus === api_status.fetching}
						type={buttonClassesType.outline}
						style={{ width: 90 }}
						className={renderClassEditStatus(editStatus)}
						onClick={setEditStatus.bind(null, false)}
					>
						Cancel
					</Button>
				</div>
			</td>
		</tr>
	)
}

export default Row