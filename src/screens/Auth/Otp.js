import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Button, Text } from "react-native";
import OTPInputView from "@twotalltotems/react-native-otp-input";
import { showMessage } from "react-native-flash-message";
import { appErrors, registerUser } from "../../../lib/auth";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../../Redux/AuthSlice";
import { primaryColor, secondaryColor } from "../../../config";
import { checkVerification } from "../../../lib/verify";
import { userActions } from "../../../Redux/userSlice";
import { tokenActions } from "../../../Redux/tokenSlice";

const Otp = ({ route, navigation }) => {
  const [message, setMessage] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageType, setMessageType] = useState();
  const [error, setError] = useState({});
  const dispatch = useDispatch();

  const { phoneNumber } = route.params;
  const [invalidCode, setInvalidCode] = useState(false);
  const fakeUser = useSelector((state) => state.fuser.userfmeta);
  const handleMessage = (message, type = "FAILED") => {
    setMessage(message);
    setMessageType(type);
  };
  const token = useSelector((state) => state.token.userToken);
  const userData = useSelector((state) => state.user.usermeta);

  const authAxios = axios.create({
    baseURL: `https://myfoodcms189.herokuapp.com/api/`,
    headers: {
      Authorization: `Bearer ${token.jwt}`,
    },
  });
  const authAxios2 = axios.create({
    baseURL: `https://myfoodcms189.herokuapp.com/api/`,
    headers: {
      Authorization: `Bearer ${token.jwt}`,
      "Content-Type": "multipart/form-data",
    },
  });

  const imageUpload = () => {
    let uuri = fakeUser.imageLocalUri;
    const newImageUri = "file:///" + uuri.split("file:/").join("");

    const formData = new FormData();

    formData.append("files", {
      uri: newImageUri,
      type: mime.getType(newImageUri),
      name: newImageUri.split("/").pop(),
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
        authAxios
          .put(`users/${userData.id}`, {
            profilePicture: imageId,
          })
          .then((response) => {
            dispatch(
              userActions.addUser({
                id: response.data.id,
                username: response.data.username,
                email: response.data.email,
                mobileNumber: response.data.mobileNumber,
                image: response.data.profilePicture,
              })
            );
          })
          .catch((error) => {
            console.log("1" + error);
            ErrorHandle123();
            function ErrorHandle123(error) {
              var about =
                "Account.js second axios !" +
                "/" +
                "captureImage" +
                "/" +
                error;
              appErrors(about);
            }
          });
      })
      .catch((error) => {
        console.log("2" + error);
        ErrorHandle124();
        function ErrorHandle124(error) {
          var about =
            "Account.js first axios !" + "/" + "captureImage" + "/" + error;
          appErrors(about);
        }
      });
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    let username = fakeUser.firstName;
    let email = fakeUser.email;
    let password = fakeUser.password;
    let mobileNumber = phoneNumber;
    handleMessage("");
    setIsSubmitting(true);
    try {
      setIsSubmitting(true);
      registerUser(username, email, password, mobileNumber).then((res) => {
        dispatch(
          userActions.addUser({
            id: res.data.user.id,
            username: res.data.user.username,
            email: res.data.user.email,
            mobileNumber: res.data.user.mobileNumber,
            secondName: res.data.user.secondName,
            image: "",
          })
        );
        dispatch(
          tokenActions.addToken({
            jwt: res.data.jwt,
          })
        );
        //  dispatch(authActions.login());
        //  handleMessage(message);
        //    setMessage("");
        // showMessage({
        //   message: "You have registered successfully.",
        //   type: "success",
        //   backgroundColor: secondaryColor,
        //   color: "#fff",
        //   icon: "success",
        //   statusBarHeight: "34",
        // });

        //  navigation.replace("gated");
        // setIsSubmitting(false);
        imageUpload();
      });
    } catch (error) {
      setIsSubmitting(false);
      setMessage(() => (
        <Text style={styles.msgBox}>Incorrect Email or Password </Text>
      ));
      errorHandle7();
      function errorHandle7() {
        var about =
          "Method handleSubmit Register!" +
          "/" +
          "Function handleSubmit second catch error" +
          "/" +
          error;
        appErrors(about);
      }
    }
    //  setIsSubmitting(false);
  };
  const navigateToImage = () => {
    navigation.navigate("profile Picture");
  };
  return (
    <SafeAreaView style={styles.wrapper}>
      <Text style={styles.prompt}>Enter the code we sent you</Text>
      <Text style={styles.message}>
        {`Your phone (${phoneNumber}) will be used to protect your account each time you log in.`}
      </Text>
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
            if (!success) setInvalidCode(true);
            success &&
              //&& handleSubmit();

              navigateToImage();
          });
        }}
      />
      {invalidCode && <Text style={styles.error}>Incorrect code.</Text>}
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
