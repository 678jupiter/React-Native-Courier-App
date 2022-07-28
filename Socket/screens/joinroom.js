import { StyleSheet, Text, View, Button } from "react-native";
import React, { useState } from "react";
import io from "socket.io-client";

const Joinroom = ({ navigation }) => {
  const [room, setRoom] = useState(false);
  const [enter, setEnter] = useState(true);
  const [userName, setUserName] = useState("Humphrey");
  const [messages, setMessages] = useState();
  const [info, setInfo] = useState("");
  const socket = io("http://localhost:4000");
  function showRoom() {
    setRoom(true);
    setEnter(false);
  }

  function handleRoomSubmit() {
    const input = "nico_room";
    socket.emit("enter_room", input, showRoom);
  }

  function addMessage(message) {
    setInfo(message);
  }
  socket.on("welcome", () => {
    addMessage("someone joined");
  });
  socket.on("bye", () => {
    addMessage("someone left ");
  });

  function handleMessageSubmit() {
    let roomName = "nico_room";
    const inputM = "Courier";
    socket.emit("new_message", inputM, roomName, () => {
      addMessage(`Courier: ${inputM}`);
    });
  }

  socket.on("new_message", addMessage);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
      }}
    >
      {enter === true ? (
        <Button title="Enter Room " onPress={() => handleRoomSubmit()}></Button>
      ) : null}

      {room === false ? null : (
        <View>
          <Text>Room</Text>
          <Text>{info}</Text>
          <Button title="Send" onPress={() => handleMessageSubmit()}></Button>
        </View>
      )}
    </View>
  );
};

export default Joinroom;

const styles = StyleSheet.create({});
