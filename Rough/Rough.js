import { View } from "react-native";
import React, { useEffect, useState } from "react";
import TextInput from "../components/atoms/TextInput";
import { Space } from "../components";
import axios from "axios";
import * as Location from "expo-location";

const Rough = () => {
  const [latitude, setLatitude] = useState("1.2345");
  const [longitude, setLongitude] = useState("1.23474");

  // useEffect to run on every reRender

  useEffect(() => {
    axios
      .put(`http://localhost:1337/api/restaurant-orders/44`, {
        data: {
          Latitude: latitude,
          Longitude: longitude,
        },
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    console.log("Rerender");
  }, [latitude, longitude]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (!status === "granted") {
        console.log("Nonono");
        return;
      }

      let location = await Location.getCurrentPositionAsync();
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    })();

    const foregroundSubscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 500,
      },
      (updatedLocation) => {
        setLatitude(updatedLocation.coords.latitude);
        setLongitude(updatedLocation.coords.longitude);
      }
    );
    return foregroundSubscription;
  }, []);

  /// automatically check if Driver has arrived the destination

  return (
    <View style={{ justifyContent: "center", flex: 1, margin: 20 }}>
      <TextInput placeholder="lat" onChangeText={(text) => setLatitude(text)} />
      <Space height={10} />
      <TextInput
        placeholder="lng"
        onChangeText={(text) => setLongitude(text)}
      />
    </View>
  );
};

export default Rough;
