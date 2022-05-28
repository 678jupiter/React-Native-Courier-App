import { View, Text } from "react-native";
import React from "react";

const Track = () => {
  retryOperation();
  let Ostatus = "Delivering";
  let exit = 0;

  async function retryOperation() {
    while (exit < 10) {
      try {
        if (exit === 10) {
          break;
        }
        switch (Ostatus) {
          case "Delivering":
            if (Ostatus === "Delivering") {
              console.log("Should Loop after 30 sec Fetch");
              exit = exit + 1;

              // fetch the drivers courierLat & courierLng  === to update the UI  and develiryStatus
              // if res.data.status === "Arrived" add this line of code ====>>  Ostatus = "Arrived";
              // is status === "Arrived" then  set Ostatus === "Arrived"
            }

            break;
          case "Arrived":
            if (Ostatus === "Arrived") {
              // do something
              console.log("Driver has arrived");
              exit = exit + 10;
            }
            break;

          default:
            break;
        }
      } catch (error) {
        console.log("Try Catch Err" + error);
      }
      await sleep(3000);
    }
  }
  retryOperation();
  async function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  return (
    <View
      style={{
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <Text onPress={retryOperation}>Track</Text>
    </View>
  );
};

export default Track;
