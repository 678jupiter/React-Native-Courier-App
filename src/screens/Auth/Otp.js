import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Button,
  Text,
  ActivityIndicator,
} from "react-native";
import OTPInputView from "@twotalltotems/react-native-otp-input";
import { showMessage } from "react-native-flash-message";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../../Redux/AuthSlice";
import { primaryColor, secondaryColor } from "../../../config";
import { checkVerification } from "../../../lib/verify";
import { userActions } from "../../../Redux/userSlice";
import { tokenActions } from "../../../Redux/tokenSlice";
import axios from "axios";
import mime from "mime";

const Otp = ({ route, navigation }) => {
  const [message, setMessage] = useState();
  const [info, setinfo] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageType, setMessageType] = useState();
  const [error, setError] = useState({});
  const dispatch = useDispatch();

  // const { phoneNumber } = route.params;
  const phoneNumber = "0799568838";
  const [invalidCode, setInvalidCode] = useState(false);
  const fakeUser = useSelector((state) => state.fuser.userfmeta);
  const handleMessage = (message, type = "FAILED") => {
    setMessage(message);
    setMessageType(type);
  };
  const token = useSelector((state) => state.token.userToken);
  const userData = useSelector((state) => state.user.usermeta);

  const globallFunction = () => {
    setIsSubmitting(true);
    setinfo("Registering your Acount...");
    let username = fakeUser.firstName;
    let email = fakeUser.email;
    let password = fakeUser.password;
    let mobileNumber = phoneNumber;
    var func_User_Id = "";
    var func_UserName = "";
    var func_UserImage = "";
    var func_Jwt = "";

    var func_SecondName = "";
    axios
      .post(`https://myfoodcms189.herokuapp.com/api/auth/local/register`, {
        username,
        email,
        password,
        mobileNumber,
      })
      .then((res) => {
        dispatch(
          userActions.addUser({
            id: res.data.user.id,
            username: res.data.user.username,
            email: res.data.user.email,
            mobileNumber: res.data.user.mobileNumber,
            image: "",
          })
        );
        dispatch(
          tokenActions.addToken({
            jwt: res.data.jwt,
          })
        );
        (func_Jwt = res.data.jwt), (func_User_Id = res.data.user.id);
        func_UserName = res.data.user.username;
        setinfo("Uploading Profile Picture...");
        const newImageUri =
          "file:///" + fakeUser.imageLocalUri.split("file:/").join("");

        const formData = new FormData();

        formData.append("files", {
          uri: newImageUri,
          type: mime.getType(newImageUri),
          name: newImageUri.split("/").pop(),
        });
        const authAxios2 = axios.create({
          baseURL: `https://myfoodcms189.herokuapp.com/api/`,
          headers: {
            Authorization: `Bearer ${func_Jwt}`,
            "Content-Type": "multipart/form-data",
          },
        });
        authAxios2
          .post("upload", formData)
          .then((res) => {
            const [
              {
                formats: {
                  medium: { url },
                },
              },
            ] = res.data;
            var imageId = url;
            func_UserImage = url;

            const authAxios = axios.create({
              baseURL: `https://myfoodcms189.herokuapp.com/api/`,
              headers: {
                Authorization: `Bearer ${func_Jwt}`,
              },
            });
            authAxios
              .put(`users/${func_User_Id}`, {
                profilePicture: imageId,
              })
              .then((response) => {
                authAxios
                  .post(`couriers`, {
                    data: {
                      firstName: func_UserName,
                      secondName: fakeUser.secondName,
                      users_permissions_user: func_User_Id,
                      mobileNumber: phoneNumber,
                      active: true,
                      image: func_UserImage,
                    },
                  })
                  .then((res) => {
                    setIsSubmitting(false);
                    setinfo("");
                    dispatch(
                      userActions.addUser({
                        id: response.data.id,
                        username: response.data.username,
                        email: response.data.email,
                        mobileNumber: response.data.mobileNumber,
                        image: response.data.profilePicture,
                      })
                    );
                    dispatch(authActions.login());
                    handleMessage(message);
                    setMessage("");
                    showMessage({
                      message: "You have registered successfully.",
                      type: "success",
                      backgroundColor: secondaryColor,
                      color: "#fff",
                      icon: "success",
                      statusBarHeight: "34",
                    });
                  })
                  .catch((error) => {
                    alert(`Merging User as Couri ${error}`);
                  });
              })
              .catch((error) => {
                alert(`Placing Profile Image ${error}`);
              });
          })
          .catch((error) => {
            alert(`Image Upload ${error}`);
          });
      })
      .catch((error) => {
        alert(`registration ${error}`);
      });
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <Text style={styles.prompt}>Enter the code we sent you</Text>
      <Text style={styles.message}>{`Your phone is (${phoneNumber}).`}</Text>
      <Button
        title="Edit Phone Number"
        onPress={() => navigation.replace("phoneNumberV")}
      />
      <OTPInputView
        style={{ width: "80%", height: 200 }}
        pinCount={6}
        autoFocusOnLoad
        codeInputFieldStyle={styles.underlineStyleBase}
        codeInputHighlightStyle={styles.underlineStyleHighLighted}
        onCodeFilled={(code) => {
          checkVerification(phoneNumber, code).then((success) => {
            console.log(success);
            if (!success) {
              setInvalidCode(true);
            }
            if (success) {
              globallFunction();
            }
          });
        }}
      />
      {invalidCode && <Text style={styles.error}>Incorrect code.</Text>}
      {isSubmitting ? (
        <>
          <ActivityIndicator color="black" size="large" />
          <Text>Wait...</Text>
          <Text>{info}</Text>
        </>
      ) : null}
      <Button title="GLOBAL" onPress={() => globallFunction()} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  borderStyleBase: {
    width: 30,
    height: 45,
  },

  borderStyleHighLighted: {
    borderColor: "#03DAC6",
  },

  underlineStyleBase: {
    width: 30,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 1,
    color: "black",
    fontSize: 20,
  },

  underlineStyleHighLighted: {
    borderColor: "#03DAC6",
  },

  prompt: {
    fontSize: 24,
    paddingHorizontal: 30,
    paddingBottom: 20,
  },

  message: {
    fontSize: 16,
    paddingHorizontal: 30,
  },

  error: {
    color: "red",
  },
  msgBox: {
    fontFamily: "CircularStdBold",
    fontSize: 12,
    //marginBottom: 10,

    textAlign: "center",
    justifyContent: "center",
    color: primaryColor,
  },
});

export default Otp;
