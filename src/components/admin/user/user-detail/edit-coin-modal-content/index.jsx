import CoinRecord from "../coin-record";


function EditCoinModalContent(props) {
	const {
		allCoin,
		userCoin,
		id
	} = props;

	const findUserCoinAmount = (coinName) => {
		return userCoin[coinName.toLowerCase() + '_balance'] || 0;
	}

	const render = () => {
		return allCoin?.map(item => {
			return (
				<CoinRecord
					key={item.name}
					id={id}
					coinAmount={findUserCoinAmount(item.name)}
					coinName={item.name}
				/>
			)
		})
	}
	return (
		<>
			{render()}
		</>
	)
}

export default EditCoinModalContent