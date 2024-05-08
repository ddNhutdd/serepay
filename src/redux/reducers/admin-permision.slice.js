import { createSlice } from "@reduxjs/toolkit";

const adminPermision = createSlice({
	name: "adminPermision",
	initialState: {
		permision: null,
		authenticating: true,
		reloadSideBar: Date.now()
	},
	reducers: {
		setAdminPermision: (state, action) => {
			state.permision = action.payload;
			state.authenticating = false;
		},
		setAuthenticationStatus: (state, action) => {
			state.authenticating = action.payload;
		},
		reloadSideBar: (state) => {
			state.reloadSideBar = Date.now()
		}
	},
});

export default adminPermision.reducer;
export const { setAdminPermision, setAuthenticationStatus, reloadSideBar } = adminPermision.actions;
export const getAdminPermision = (state) => state?.adminPermision;
export const getReloadSideBar = state => state?.adminPermision?.reloadSideBar;