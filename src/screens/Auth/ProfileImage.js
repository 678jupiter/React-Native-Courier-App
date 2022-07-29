import { Button, SafeAreaView, StyleSheet } from "react-native";
import React from "react";
import { colors } from "../../../config";
import axios from "axios";
import { useSelector } from "react-redux";

const ProfileImage = () => {
  const token = useSelector((state) => state.token.userToken);
  const userData = useSelector((state) => state.user.usermeta);
  const authAxios = axios.create({
    baseURL: "https://myfoodcms189.herokuapp.com/api/",
    headers: {
      Authorization: `Bearer ${token.jwt}`,
    },
  });
  const send = async () => {
    await authAxios
      .post(`couriers`, {
        data: {
          firstName: "Name",
          secondName: "kkakka",
          users_permissions_user: userData.id,
          mobileNumber: "ajajaj",
          active: true,
          image: "jajaj",
        },
      })
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <SafeAreaView style={styles.safeContainer}>
      <Button title="SEND" onPress={() => send()} />
    </SafeAreaView>
  );
};

export default ProfileImage;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.light_gray,
    justifyContent: "center",
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
