import { createSlice } from "@reduxjs/toolkit";
import { localStorageVariable } from "src/constant";
import { getLocalStorage } from "src/util/common";

export const initialState = {
    accountName: getLocalStorage(localStorageVariable.accountName) || getLocalStorage(localStorageVariable.user)?.username || '',
  }
  const accountSlice = createSlice({
    name: "accountSlice",
    initialState,
    reducers: {
      setAccountName : (state, action) => {
        state.accountName = action.payload;
      },
    },
  });
  
  export default accountSlice.reducer;
  export const { setAccountName, setUsdtBalance } = accountSlice.actions;
  export const getAccountName = (state) => state.account.accountName;