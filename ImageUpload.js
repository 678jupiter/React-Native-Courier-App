import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import axios from "axios";

const ImageUpload = () => {
  const authAxios = axios.create({
    baseURL: `https://myfoodcms189.herokuapp.com/api/`,
    headers: {
      Authorization: `Bearer ${token.jwt}`,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 20 }}>
      <View style={{ flex: 1, marginRight: 10, marginLeft: 10 }}>
        <View style={styles.avaContainer}>
          <ImageBackground
            source={
              {
                // uri: imagePlace,
              }
            }
            style={styles.avatar}
          ></ImageBackground>
        </View>
        <View style={{ flex: 0.5, justifyContent: "center" }}>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => captureImage()}
          >
            <Text style={styles.textStyle}>Take Photo</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ImageUpload;

const styles = StyleSheet.create({
  avaContainer: {
    flex: 0.5,
    alignItems: "center",
    // paddingTop: 10,
    justifyContent: "center",
    //paddingBottom: 10,
    // backgroundColor: "red",
  },
  avatar: {
    overflow: "hidden",
    // borderRadius: 180,
    width: 230,
    height: 230,
    backgroundColor: "grey",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    height: 60,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 28,
  },
});
