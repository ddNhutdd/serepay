import { localStorageVariable } from "src/constant";
import { getLocalStorage } from "src/util/common";

const setDefaultIsAdmin = function () {
  try {
    const vai =
      getLocalStorage(localStorageVariable.thisIsAdmin) ||
      +(getLocalStorage(localStorageVariable.user)?.id === 1) ||
      false;
    return vai;
  } catch (error) {
    return false;
  }
};

const defaultState = {
  isLogin:
    getLocalStorage(localStorageVariable.token) && getLocalStorage(localStorageVariable.user)
      ? true
      : false,
  username: getLocalStorage(localStorageVariable.user)?.username,
  isAdmin: setDefaultIsAdmin(),
};

export const loginReducer = (state = defaultState, action) => {
  switch (action.type) {
    case "USER_LOGIN": {
      console.log('1', typeof getLocalStorage(localStorageVariable.user));
      return {
        ...state,
        isLogin: true,
        username: getLocalStorage(localStorageVariable.user)?.username,
      };
    }
    case "USER_LOGOUT": {
      return {
        ...state,
        isLogin: false,
      };
    }
    case "USER_ADMIN":
      return {
        ...state,
        isAdmin: action.payload,
      };
    default:
      return state;
  }
};
