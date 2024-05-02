const defaultState = {
  data: [],
};

export const chartReducer = (state = defaultState, action) => {
  switch (action.type) {
    case "GET_CHART": {
      return {
        ...state,
        data: action.payload,
      };
    }

    default:
      return state;
  }
};
