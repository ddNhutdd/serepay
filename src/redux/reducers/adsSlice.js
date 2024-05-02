import { createSlice } from "@reduxjs/toolkit";
const adsSlice = createSlice({
  name: "ads",
  initialState: {
    adsItem: "",
  },
  reducers: {
    setAdsItem: (state, action) => {
      state.adsItem = action.payload;
    },
  },
});
export default adsSlice.reducer;
export const { setAdsItem } = adsSlice.actions;
//
export const getAdsItem = (state) => state.adsSliceReducer.adsItem;
