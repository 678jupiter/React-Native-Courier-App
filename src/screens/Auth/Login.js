import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  SafeAreaView,
  Dimensions,
  Text,
  Pressable,
} from "react-native";
import { Button, Header, Space, TextInput } from "../../../components";
import { primaryColor, secondaryColor } from "../../../config";
import { TextInput as MytextInput } from "react-native";
import KeyboardScrollUpForms from "../../../utils/KeyboardScrollUpForms";
import { useState } from "react";
import { login } from "../../../lib/auth";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../../../Redux/userSlice";
import { authActions } from "../../../Redux/AuthSlice";
import { tokenActions } from "../../../Redux/tokenSlice";
import axios from "axios";
import { curActions } from "../../../Redux/courSlice";

const LogIn = ({ navigation }) => {
  const [identifier, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const handlePasswordVisibility = () => {};
  const handleSubmit = async () => {
    setIsSubmitting(true);
    let userId = "";
    axios
      .post(`https://myfoodcms189.herokuapp.com/api/auth/local/`, {
        identifier: identifier,
        password: password,
      })
      .then((res) => {
        const {
          jwt,
          user: { id, username, mobileNumber, secondName, email },
        } = res.data;
        console.log(id);
        userId = id;
        dispatch(
          userActions.addUser({
            id: id,
            username: username,
            email: email,
            mobileNumber: mobileNumber,
            secondName: secondName,
          })
        );
        dispatch(
          tokenActions.addToken({
            jwt: jwt,
          })
        );

        axios
          .get(`https://myfoodcms189.herokuapp.com/api/couriers/?populate=*`)
          .then((res) => {
            const { data } = res.data;
            //  console.log(data);
            const courierMe = data.filter(
              (item) =>
                item.attributes.users_permissions_user.data.id === userId
            );
            console.log(courierMe);
            const [
              {
                id,
                attributes: {
                  active,
                  secondName,
                  firstName,
                  image,
                  mobileNumber,
                },
              },
            ] = courierMe;
            dispatch(
              curActions.addcur({
                cid: id,
                image: image,
                phoneNumber: mobileNumber,
                secondName: secondName,
                firstName: firstName,
                active: active,
              })
            );
            dispatch(authActions.login());

            setIsSubmitting(false);
          })
          .catch((error) => {
            console.log(`Get Couries${error}`);
          });
      })
      .catch((error) => {
        console.log(`Login ${error}`);
      });
  };

  const space = Dimensions.get("screen").height / 28;

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardScrollUpForms
        enabled
        behavior={Platform.OS == "ios" ? "padding" : "height"}
      >
        {/* {Platform.OS === "android" && <StatusBar backgroundColor="#000000" />} */}

        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <Space height={space} />
          <Header
            // title="Login"
            desc="For fast delivering, login first. 🤝"
          />
          <View style={styles.container}>
            <TextInput
              KeyboardType="email-address"
              label="Email"
              onChangeText={(text) => setEmail(text)}
            />
            <Space height={30} />
            <View>
              <Text style={styles.label}>Password</Text>

              <View style={styles.inputContainer}>
                <MytextInput
                  style={styles.inputField}
                  onChangeText={(text) => setPassword(text)}
                  value={password}
                  //  secureTextEntry={passwordVisibility}
                />
                <Pressable onPress={handlePasswordVisibility}>
                  {/* <MaterialCommunityIcons
                    name={rightIcon}
                    size={22}
                    color="#232323"
                  /> */}
                </Pressable>
              </View>
            </View>

            {/* <Space height={25} />
            <MsgBox type={messageType}>{message}</MsgBox>
            */}
            <Space height={25} />

            <Button
              label="Log In"
              radius={6}
              txtSize={14}
              bgColor={secondaryColor}
              padSizeX={20}
              borderWidth={0}
              fontFam="CircularStdBold"
              txtDecorationLine="none"
              onPress={handleSubmit}
              isSubmitting={isSubmitting}
            />

            <Space height={40} />
            <Button
              label="Register a new account"
              txtSize={13}
              radius={0}
              borderWidth={0}
              bgColor="#fff"
              textColor={primaryColor}
              fontFam="CircularStdBold"
              onPress={() => navigation.navigate("Register")}
            />
            <Space height={20} />
            <Button
              label="Forgot password"
              txtSize={12}
              radius={0}
              borderWidth={0}
              bgColor="#fff"
              textColor={primaryColor}
              fontFam="CircularStdBold"
              onPress={() => navigation.navigate("ForgotPassword")}
            />
          </View>
        </ScrollView>
      </KeyboardScrollUpForms>
      {/* <FlashMessage
        // ref={showMessage}
        style={{ backgroundColor: 'red' }}
        textStyle={{ fontFamily: 'CircularStdBold' }}
        hideOnPress={true}
        duration={4000}
      /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.compose({
  page: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginTop: 0,
    flex: 1,
  },
  msgBox: {
    fontFamily: "CircularStdBold",
    fontSize: 12,
    //marginBottom: 10,

    textAlign: "center",
    justifyContent: "center",
    color: primaryColor,
  },
  label: {
    fontFamily: "CircularStdBold",
    fontSize: 14,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    fontFamily: "CircularStdBook",
    fontSize: 14,
    color: "#000",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 6,
    borderStyle: "solid",
    borderColor: "#32cd32",
  },
  inputField: {
    width: "90%",
  },
});

export default LogIn;
