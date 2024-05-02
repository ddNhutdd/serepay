const defaultState = {
  res: {},
};

export const resReducer = (state = defaultState, action) => {
  switch (action.type) {
    case "GET_SOCKET": {
      return {
        ...state,
        res: action.payload,
      };
    }

    case "GET_SOCKET_NULL": {
      // fake dữ liệu vì chỗ này socket trả về null

      const currentOrder = state.res.order;

      return {
        ...state,
        res: {
          ...state.res,
          order: currentOrder === 0 ? 1 : 0,
        },
      };
    }

    default:
      return state;
  }
};
