import { useDispatch } from "react-redux";
import { defaultCurrency, localStorageVariable } from "src/constant";
import { currencySetCurrent } from "src/redux/actions/currency.action";
import { removeLocalStorage } from "src/util/common";
import socket from "src/util/socket";

const useLogout = () => {
	const dispatch = useDispatch();

	const logout = () => {
		dispatch({ type: "USER_ADMIN", payload: false });
		removeLocalStorage(localStorageVariable.lng);
		removeLocalStorage(localStorageVariable.user);
		removeLocalStorage(localStorageVariable.token);
		removeLocalStorage(localStorageVariable.coinToTransaction);
		removeLocalStorage(localStorageVariable.currency);
		removeLocalStorage(localStorageVariable.adsItem);
		removeLocalStorage(localStorageVariable.coinNameToTransaction);
		removeLocalStorage(localStorageVariable.createAds);
		removeLocalStorage(localStorageVariable.moneyToTransaction);
		dispatch(currencySetCurrent(defaultCurrency));
		removeLocalStorage(localStorageVariable.coin);
		removeLocalStorage(localStorageVariable.coinFromWalletList);
		removeLocalStorage(localStorageVariable.amountFromWalletList);
		removeLocalStorage(localStorageVariable.thisIsAdmin);
		dispatch({ type: "USER_LOGOUT" });
		socket.off('messageTransfer');
	}
	return logout;
}

export default useLogout;