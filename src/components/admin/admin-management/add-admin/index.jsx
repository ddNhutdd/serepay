import { useState } from 'react';
import { Button } from 'src/components/Common/Button';
import { Input } from 'src/components/Common/Input';
import { api_status } from 'src/constant';
import useForm from 'src/hooks/use-form';

function AddAdmin(props) {
	const {
		fetchAddAdmin,
		fetchAddAdminStatus
	} = props;





	const [inputValue, setInputValue] = useState();

	const inpuValueChangeHandle = (ev) => {
		setInputValue(ev.target.value);
	}


	const formSubmit = async (value) => {
		try {
			await fetchAddAdmin({
				"userid": value.userId
			})
		} catch (error) {
			console.log(error)
		}
	}

	const [register, onSubmit, errors, reset, values] = useForm(formSubmit)




	return (
		<form onSubmit={onSubmit} className='d-flex gap-2 alignItem-start'>
			<div >
				<Input
					placeholder={`User Id`}
					value={inputValue}
					onChange={inpuValueChangeHandle}
					{...register('userId', '')}
					require={[true, 'Require']}
					errorMes={errors['userId']}
				/>
			</div>
			<Button loading={fetchAddAdminStatus === api_status.fetching} style={{ whiteSpace: 'nowrap' }}>Add admin</Button>
		</form>
	)
}

export default AddAdmin