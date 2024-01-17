import axios from "axios";
import { DOMAIN } from "../../util/service";

export const getChart = (symbol) => {
  return async (dispatch) => {
    try {
      let response = await axios({
        url: DOMAIN + "api/binaryOption/getChart",
        data: { symbol },
        method: "POST",
      });

      dispatch({
        type: "GET_CHART",
        payload: response.data.data,
      });
    } catch (error) {
      console.log(error);
    }
  };
};
