import axios from "axios";
import { RAWEN } from "@env";

export const registerUser = (username, email, password, mobileNumber) => {
  return new Promise((resolve, reject) => {
    axios
      .post(`${RAWEN}auth/local/register`, {
        username,
        email,
        password,
        mobileNumber,
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

export const login = (identifier, password) => {
  return new Promise((resolve, reject) => {
    axios
      .post(`${RAWEN}auth/local/`, {
        identifier,
        password,
      })
      .then((res) => {
        //resolve the promise to set loading to false in SignUp form
        resolve(res);
        //redirect back to home page for restaurance selection
      })
      .catch((error) => {
        //reject the promise and pass the error object back to the form
        reject(error);
      });
  });
};
