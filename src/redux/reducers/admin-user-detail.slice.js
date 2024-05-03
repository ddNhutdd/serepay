import { createSlice } from "@reduxjs/toolkit";
const adminUser = createSlice({
	name: "adminUser",
	initialState: {
		profile: {},
	},
	reducers: {
		setProfile: (state, action) => {
			state.profile = action.payload;
		},
	},
});
export default adminUser.reducer;
export const { setProfile } = adminUser.actions;
//
export const getProfile = (state) => state.adminUserSlice.profile;