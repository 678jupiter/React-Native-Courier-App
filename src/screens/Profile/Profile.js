import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { useSelector } from "react-redux";

const Profile = () => {
  const user = useSelector((state) => state.cur.curmeta);
  // console.log(user);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{ flex: 0.4, justifyContent: "center", alignItems: "center" }}
      >
        <View style={styles.avaContainer}>
          <ImageBackground
            source={{
              uri: user.image,
            }}
            style={styles.avatar}
          ></ImageBackground>
        </View>
      </View>
      <View style={{ flex: 0.6, alignItems: "center" }}>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ marginRight: 6, fontSize: 18, color: "black" }}>
            {user.firstName}
          </Text>
          <Text style={{ fontSize: 18, color: "black" }}>
            {user.secondName}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 18, color: "black" }}>
            {user.phoneNumber}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 18, color: "black" }}>email</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ marginRight: 6, fontSize: 18, color: "black" }}>
            Completed Jobs
          </Text>
          <Text style={{ fontSize: 18, color: "black" }}>0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  avatar: {
    overflow: "hidden",
    borderRadius: 180,
    width: 180,
    height: 180,
    backgroundColor: "grey",
  },
});
