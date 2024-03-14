import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import reduxThunk from "redux-thunk";
import { chartReducer } from "./reducers/chartReducer";
import { coinReducer } from "./reducers/coinReducer";
import { loginReducer } from "./reducers/loginReducer";
import { resReducer } from "./reducers/resReducer";
import { currencyReducer } from "./reducers/currencyReducer";
import { listCoinRealTimeReducer } from "./reducers/listCoinRealTimeReducer";
import exchangeRateDisparityReducer from "./reducers/exchangeRateDisparitySlice";
import adsSliceReducer from "./reducers/adsSlice";
import p2pTradingShowSlice from "./reducers/p2pTrading";
import notifyP2pSlice from "./reducers/notifiyP2pSlice";
import bankSlice from "./reducers/bankSlice";
import exchangeRateSellSlice from "./reducers/exchangeRateSellSlice";
import account from "./reducers/accountSlice";

const rootReducer = combineReducers({
  coinReducer,
  loginReducer,
  chartReducer,
  resReducer,
  currencyReducer,
  listCoinRealTimeReducer,
  exchangeRateDisparityReducer,
  adsSliceReducer,
  p2pTradingShowSlice,
  notifyP2pSlice,
  bank: bankSlice,
  exchangeRateSell: exchangeRateSellSlice,
  account
});

const middleWare = applyMiddleware(reduxThunk);
const customCompose = compose(middleWare);

const store = createStore(rootReducer, customCompose);

export default store;
