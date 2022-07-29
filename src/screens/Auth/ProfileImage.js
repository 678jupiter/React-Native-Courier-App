import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { useState } from "react";
import { colors } from "../../../config";
import { IconText, ModalBottom, Space } from "../../../components";
import * as ImagePicker from "expo-image-picker";
import { useSelector } from "react-redux";
import axios from "axios";

const ProfileImage = () => {
  const [imageUri, setImageUrri] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
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
      var uuri = result.uri;
      var utype = result.type;
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
    }
  };
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.avaContainer}>
        <ImageBackground
          source={
            {
              //   uri: imageUri,
            }
          }
          style={styles.avatar}
        >
          <TouchableOpacity
            style={{
              top: 220,
              backgroundColor: "black",
              paddingVertical: 13,
              alignItems: "center",
              opacity: 0.8,
            }}
            onPress={toggleModal}
          >
            <View>
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "CircularStdBold",
                  fontSize: 14,
                }}
              >
                Edit
              </Text>
            </View>
          </TouchableOpacity>
        </ImageBackground>
      </View>
      <ModalBottom
        onBackdropPress={toggleModal}
        isVisible={isModalVisible}
        onPress={toggleModal}
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

export default ProfileImage;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.light_gray,
  },
  avaContainer: {
    //  flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    paddingTop: 100,
    //paddingBottom: 10,
    // backgroundColor: "red",
  },
  avatar: {
    overflow: "hidden",
    borderRadius: 180,
    width: 260,
    height: 260,
    backgroundColor: "grey",
  },
});
