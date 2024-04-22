import {createContext, useContext, useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {checkIsMainAccount, getLocalStorage} from "../../util/common";
import {localStorageVariable} from "../../constant";

const mainContext = createContext();
export const useMainAccount = () => useContext(mainContext);

export const MainAccountProvider = ({ children }) => {
	const [isMainAccount, setIsMainAccount] = useState(true);
	const isLogin = useSelector((state) => state.loginReducer.isLogin);

	useEffect(() => {
		if(!isLogin) setIsMainAccount(true)
		else if (isLogin) {
			const profile = getLocalStorage(localStorageVariable.user);
			setIsMainAccount(checkIsMainAccount(profile));
		}
	}, []);

	return (
		<mainContext.Provider value={{ isMainAccount, setIsMainAccount }}>
			{children}
		</mainContext.Provider>
	);
};