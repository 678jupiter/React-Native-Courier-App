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
import { login, registerUser } from "../../../lib/auth";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../../../Redux/userSlice";
import { authActions } from "../../../Redux/AuthSlice";

const Register = ({ navigation }) => {
  const [username, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setPhoneNumber] = useState("");
  const [password, SetPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const handlePasswordVisibility = () => {};
  const handleSubmit = async () => {
    try {
      registerUser(username, email, password, mobileNumber)
        .then((res) => {
          dispatch(
            userActions.addUser({
              jwt: res.data.jwt,
              id: res.data.user.id,
              username: res.data.user.username,
              email: res.data.user.email,
              mobileNumber: res.data.user.mobileNumber,
              secondName: res.data.user.secondName,
            }),
            dispatch(authActions.login())
          );
        })
        .catch((error) => {
          console.log("2" + error);
        });
    } catch (error) {
      console.log("1" + error);
    }
  };

  const space = Dimensions.get("screen").height / 28;

  return (
    <SafeAreaView style={styles.page}>
      <KeyboardScrollUpForms
        enabled
        behavior={Platform.OS == "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          {/* <Space height={space_height} /> */}
          {/* <Header title="Register" showDesc={false} /> */}
          {/* <Space height={8} /> */}
          <View style={styles.mainContainer}>
            {/* <View style={styles.avaForm}>
            <View style={styles.avaBorder}>
              <TouchableScale
                tension={100}
                onPress={() => console.log("register")}
              >
                <View style={styles.addAvaTextContainer}>
                  <Text style={styles.addAvaText}>Add Avatar</Text>
                </View>
              </TouchableScale>
            </View>
          </View> */}
            <TextInput
              label="Username"
              onChangeText={(text) => setFirstName(text)}
            />

            <Space height={30} />
            <TextInput label="Email" onChangeText={(text) => setEmail(text)} />
            <Space height={30} />
            <TextInput
              label="PhoneNumber"
              onChangeText={(text) => setPhoneNumber(text)}
              keyboardType="number-pad"
            />
            <Space height={30} />
            <View>
              <Text style={styles.label}>Password</Text>

              <View style={styles.inputContainer}>
                <MytextInput
                  style={styles.inputField}
                  onChangeText={(text) => SetPassword(text)}
                  value={password}
                  // secureTextEntry={passwordVisibility}
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
            <MsgBox type={messageType}>{message}</MsgBox> */}
            <Space height={25} />

            <Button
              label="Register"
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
            <Space height={50} />
          </View>
        </ScrollView>
      </KeyboardScrollUpForms>
      {/* <FlashMessage
      // ref={showMessage}2342e 
      hideOnPress={true}
      duration={4000}
      style={{ backgroundColor: 'red' }}
      textStyle={{ fontFamily: 'CircularStdBold' }}
    /> */}
    </SafeAreaView>
  );
};

export default Register;
const styles = StyleSheet.compose({
  page: {
    flex: 1,
    backgroundColor: "#fff",
    // backgroundColor: 'red',
  },
  mainContainer: {
    backgroundColor: "#fff",
    // backgroundColor: 'red',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 24,
    marginTop: 0,
    flex: 1,
  },
  avaForm: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 30,
  },
  avaBorder: {
    borderRadius: 120,
    height: 120,
    width: 120,
    borderStyle: "solid",
    borderColor: "#0030FF",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addAvaTextContainer: {
    borderRadius: 90,
    height: 100,
    width: 100,
    backgroundColor: "#0030FF",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addAvaText: {
    fontSize: 14,
    fontFamily: "CircularStdBold",
    color: "#fff",
    textAlign: "center",
    // backgroundColor: 'red',
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
  inputText: {
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
});
