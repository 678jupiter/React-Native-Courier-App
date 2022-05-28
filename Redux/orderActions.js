import { orderActions } from "./OrderSlice";

export const fetchOrders = () => {
  return async (dispatch) => {
    const fetchHandler = async () => {
      const res = await fetch("http://localhost:1337/api/restaurant-orders");
      const data = await res.json();
      return data;
    };
    try {
      const riderData = await fetchHandler();
      dispatch(orderActions.getOrders(riderData));
    } catch (error) {
      console.log(error);
    }
  };
};
