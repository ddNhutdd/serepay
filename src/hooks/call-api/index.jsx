import { useState, useRef, useEffect } from 'react';
import { api_status } from 'src/constant';


const useAsync = (asyncFn, ...params) => {
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const [status, setStatus] = useState(api_status.pending);
	const isFirst = useRef(false);

	const fetchData = async (...params) => {
		try {
			if (status === api_status.fetching) {
				return;
			} else {
				setStatus(api_status.fetching);
			}

			const result = await asyncFn(...params);
			setData(result);
			setStatus(api_status.fulfilled);
			setError(null);
		} catch (err) {
			setError(err);
			setStatus(api_status.rejected);
		}
	};


	useEffect(() => {
		if (!isFirst.current) {
			isFirst.current = true;
			fetchData(...params);
		}
	}, [])

	const run = (...newParams) => {
		fetchData(...newParams);
	};


	return [data, error, status, run];
};

export default useAsync;
