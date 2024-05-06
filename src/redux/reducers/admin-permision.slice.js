import { createSlice } from "@reduxjs/toolkit";

const adminPermision = createSlice({
	name: "adminPermision",
	initialState: {
		permision: null,
		authenticating: true,
	},
	reducers: {
		setAdminPermision: (state, action) => {
			state.permision = action.payload;
			state.authenticating = false;
		},
		setAuthenticationStatus: (state, action) => {
			state.authenticating = action.payload;
		}
	},
});

export default adminPermision.reducer;
export const { setAdminPermision, setAuthenticationStatus } = adminPermision.actions;
export const getAdminPermision = (state) => state?.adminPermision;