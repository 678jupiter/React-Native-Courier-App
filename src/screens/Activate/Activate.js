import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";

const Activate = () => {
  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 20 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          marginLeft: 20,
          marginRight: 20,
        }}
      >
        <Pressable
          style={[styles.button, styles.buttonClose]}
          //  onPress={() => PickUp()}
        >
          <Text style={styles.textStyle}>Activate</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Activate;

const styles = StyleSheet.create({
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
