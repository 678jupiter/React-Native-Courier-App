import { StyleSheet, Button, View } from "react-native";
import React, { useEffect } from "react";
import io from "socket.io-client";

const Room = () => {
  function addMessage(message) {
    console.log(message);
  }
  const submit = () => {
    const socket = io("http://localhost:4000");
    var msg = "heyy";
    socket.emit("new_message", msg, "room_1", () => {
      addMessage(`You: ${msg}`);
    });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
      }}
    >
      <Button title="Send Message" onPress={() => submit()}></Button>
    </View>
  );
};

export default Room;

const styles = StyleSheet.create({});
