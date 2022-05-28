import axios from "axios";

export const updateStatus = (id) => {
  return new Promise((resolve, reject) => {
    axios
      .put(`http://localhost:1337/api/restaurant-orders/${id}`, {
        data: {
          status: "Cooking",
        },
      })
      .then((res) => {
        //set token response from Strapi for server validation

        //resolve the promise to set loading to false in SignUp form
        resolve(res);
        //redirect back to home page for restaurance selection
        //navigation.navigate("checkout");
      })
      .catch((error) => {
        //reject the promise and pass the error object back to the form
        reject(error);
      });
  });
};
