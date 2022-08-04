import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  SafeAreaView,
  Dimensions,
  Text,
  Pressable,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  IconText,
  ModalBottom,
  Space,
  TextInput,
} from "../../../components";
import {
  colors,
  isEmail,
  MsgBox,
  primaryColor,
  secondaryColor,
} from "../../../config";
import { TextInput as MytextInput } from "react-native";
import KeyboardScrollUpForms from "../../../utils/KeyboardScrollUpForms";
import { useState } from "react";
import { registerCourier, registerUser } from "../../../lib/auth";
import { useDispatch, useSelector } from "react-redux";
import { userActions } from "../../../Redux/userSlice";
import { authActions } from "../../../Redux/AuthSlice";
import { tokenActions } from "../../../Redux/tokenSlice";
import { useNavigation } from "@react-navigation/native";
import { useTogglePasswordVisibility } from "../../../components/useTogglePasswordVisibility";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fakeuserActions } from "../../../Redux/holderslice";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";

const Register = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [username, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [email, setEmail] = useState("");
  const [password, SetPassword] = useState("");
  const [message, setMessage] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageType, setMessageType] = useState();
  const { passwordVisibility, rightIcon, handlePasswordVisibility } =
    useTogglePasswordVisibility();
  const [imagePlace, setImage] = useState("");

  const handleMessage = (message, type = "FAILED") => {
    setMessage(message);
    setMessageType(type);
  };

  const isFormValid = () => {
    if (
      email === "" ||
      password === "" ||
      username === "" ||
      secondName === ""
    ) {
      setMessage(() => (
        <Text style={styles.msgBox}>All fields are required!</Text>
      ));
      setIsSubmitting(false);
      return false;
    }
    if (imagePlace === "") {
      setMessage(() => <Text style={styles.msgBox}>Picture is required!</Text>);
      setIsSubmitting(false);
      return false;
    }

    if (!isEmail(email)) {
      setMessage(() => (
        <Text style={styles.msgBox}>Please add a valid email address!</Text>
      ));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      return;
    }
    handleMessage("");
    setIsSubmitting(true);
    dispatch(
      fakeuserActions.addFake({
        firstName: username,
        secondName: secondName,
        email: email,
        password: password,
        imageLocalUri: imagePlace,
      })
    );
    setIsSubmitting(false);
    navigation.navigate("phoneNumberV");
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const captureImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled) {
      // setImageUri(result.uri);
      //setImageType(result.type);
      setImage(result.uri);
      toggleModal();
    }
  };

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
          <View style={styles.avaContainer}>
            <ImageBackground
              source={{
                uri: imagePlace,
              }}
              style={styles.avatar}
            >
              <TouchableOpacity
                style={{
                  top: 135,
                  backgroundColor: "black",
                  paddingVertical: 13,
                  alignItems: "center",
                  opacity: 0.8,
                }}
                onPress={() => toggleModal()}
              >
                <View>
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: "CircularStdBold",
                      fontSize: 14,
                    }}
                  >
                    Take Picture
                  </Text>
                </View>
              </TouchableOpacity>
            </ImageBackground>
          </View>
          <View style={styles.mainContainer}>
            <TextInput
              label="First Name"
              onChangeText={(text) => setFirstName(text)}
            />
            <Space height={10} />
            <TextInput
              label="Second Name"
              onChangeText={(text) => setSecondName(text)}
            />

            <Space height={10} />
            <TextInput
              label="Email"
              keyboardType="email-address"
              onChangeText={(text) => setEmail(text)}
            />
            <Space height={10} />

            <View>
              <Text style={styles.label}>Password</Text>

              <View style={styles.inputContainer}>
                <MytextInput
                  style={styles.inputField}
                  onChangeText={(text) => SetPassword(text)}
                  value={password}
                  secureTextEntry={passwordVisibility}
                />
                <Pressable onPress={handlePasswordVisibility}>
                  <MaterialCommunityIcons
                    name={rightIcon}
                    size={22}
                    color="#232323"
                  />
                </Pressable>
              </View>
            </View>
            <Space height={10} />
            <MsgBox type={messageType}>{message}</MsgBox>
            <Space height={10} />

            <Button
              label="Register"
              radius={6}
              txtSize={14}
              bgColor={colors.blurple}
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
      <ModalBottom
        onBackdropPress={toggleModal}
        isVisible={isModalVisible}
        onPress={() => toggleModal()}
        label="Close"
      >
        <TouchableOpacity onPress={captureImage}>
          <IconText icon="📷" text="Take Photo" />
        </TouchableOpacity>
        <Space height={10} />
        {/* <TouchableOpacity onPress={uploadImage}>
            <IconText icon="🖼" text="Choose From Gallery" />
          </TouchableOpacity> */}
      </ModalBottom>
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
    borderColor: colors.blurple,
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
  avaContainer: {
    alignItems: "center",
    paddingTop: 10,
    //paddingBottom: 10,
    // backgroundColor: "red",
  },
  avatar: {
    overflow: "hidden",
    borderRadius: 180,
    width: 180,
    height: 180,
    backgroundColor: "grey",
  },
});
