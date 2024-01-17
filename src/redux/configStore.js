import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import reduxThunk from "redux-thunk";
import { chartReducer } from "./reducers/chartReducer";
import { coinReducer } from "./reducers/coinReducer";
import { loginReducer } from "./reducers/loginReducer";
import { resReducer } from "./reducers/resReducer";
import { currencyReducer } from "./reducers/currencyReducer";
import { listCoinRealTimeReducer } from "./reducers/listCoinRealTimeReducer";
import wallet2Reducer from "./reducers/wallet2Slice";
import exchangeRateDisparityReducer from "./reducers/exchangeRateDisparitySlice";
import adsSliceReducer from "./reducers/adsSlice";
import p2pTradingShowSlice from "./reducers/p2pTrading";
import walletWithdrawSlice from "./reducers/walletWithdraw";

const rootReducer = combineReducers({
  coinReducer,
  loginReducer,
  chartReducer,
  resReducer,
  currencyReducer,
  listCoinRealTimeReducer,
  wallet2Reducer,
  exchangeRateDisparityReducer,
  adsSliceReducer,
  p2pTradingShowSlice,
  walletWithdrawSlice,
});

const middleWare = applyMiddleware(reduxThunk);
const customCompose = compose(middleWare);

const store = createStore(rootReducer, customCompose);

export default store;
