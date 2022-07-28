import {
  Alert,
  Button,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchOrders } from "../../Redux/orderActions";
import io from "socket.io-client";
import * as Location from "expo-location";
import { getPreciseDistance } from "geolib";

const NavigatetoApp = ({ route, navigation }) => {
  const { id } = route.params;
  const { customerLatitude } = route.params;
  const { customerLongitude } = route.params;
  const { address } = route.params;
  const { building } = route.params;
  //const { status } = route.params;
  const { Odishes } = route.params;
  const navigate = () => {
    Linking.openURL(
      `google.navigation:q=${customerLatitude}+${customerLongitude}`
    );
  };

  const socket = io("https://socketitisha.herokuapp.com");

  function showRoom() {
    console.log("Joined Room");
  }
  useEffect(() => {
    const input = id;
    socket.emit("enter_room", input, showRoom);
  }, []);

  const [init, setInite] = useState(0);
  const dispatch = useDispatch();
  useEffect(() => {
    let isCancelled = false;
    dispatch(fetchOrders());
    return () => {
      isCancelled = true;
    };
  }, [init]);
  const token = useSelector((state) => state.token.userToken);
  const authAxios = axios.create({
    baseURL: "https://myfoodcms189.herokuapp.com/api/",
    headers: {
      Authorization: `Bearer ${token.jwt}`,
    },
  });

  const startDelivering = async () => {
    await authAxios
      .put(`restaurant-orders/${id}`, {
        data: {
          status: "Delivering",
        },
      })
      .then(function (response) {
        setInite(1);
        console.log("res");
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const Arrived = async () => {
    await authAxios
      .put(`restaurant-orders/${id}`, {
        data: {
          status: "Arrived",
        },
      })
      .then(function (response) {
        setInite(1);
        console.log("res");
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (!status === "granted") {
        console.log("Nonono");
        return;
      }

      let location = await Location.getCurrentPositionAsync();
      setDriverLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();

    const foregroundSubscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
      },
      (updatedLocation) => {
        setDriverLocation({
          latitude: updatedLocation.coords.latitude,
          longitude: updatedLocation.coords.longitude,
        });
        authAxios
          .put(`restaurant-orders/${id}`, {
            data: {
              courierLat: JSON.stringify(updatedLocation.coords.latitude),
              courierLng: JSON.stringify(updatedLocation.coords.longitude),
            },
          })
          .then(function (response) {
            console.log("Updated");
          })
          .catch(function (error) {
            console.log(error);
          });
        let roomName = id;
        const inputM = {
          courierLat: JSON.stringify(updatedLocation.coords.latitude),
          courierLng: JSON.stringify(updatedLocation.coords.longitude),
        };
        socket.emit("new_message", inputM, roomName, () => {
          console.log("emit");
        });
      }
    );
    return foregroundSubscription;
  }, []);

  const [distance, setDistance] = useState();
  const [isDriverClose, setIsDriverClose] = useState(false);

  // check whetehr coDriv is Close to the custo

  const checkLocationStatus = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(`Permission to access location was denied`, "");

      return;
    }

    if (status === "granted") {
      let result = await Location.getCurrentPositionAsync({});

      var pdis = getPreciseDistance(
        {
          latitude: Number(customerLatitude),
          longitude: Number(customerLongitude),
        },
        {
          latitude: Number(result.coords.latitude),
          longitude: Number(result.coords.longitude),
        }
      );
      // alert(`Precise Distance\n\n${pdis} Meter\nOR\n${pdis / 1000} KM`);
      setDistance(Number(pdis / 1000));

      if (Number(pdis / 1000) <= 0.1) {
        setIsDriverClose(true);
        Arrived();
      }
    }
    if (status !== "granted") {
      allowLocation();
    }
  };
  const allowLocation = async () => {
    let res = await Location.hasServicesEnabledAsync();
    if (res === false) {
      Alert.alert(`Please allow Location`, "", [
        {
          text: "cancel",
          onPress: () => navigation.goBack(),
          style: "cancel",
        },
        { text: "OK", onPress: () => Location.enableNetworkProviderAsync() },
      ]);
    }
    if (res === true) {
      return;
    }
  };

  useEffect(() => {
    checkLocationStatus();
  }, []);

  const LOCATION_TASK_NAME = "background-location-task";

  const requestPermissions = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    console.log(status);
    if (status === "granted") {
      setAppReady(true);

      // Location.requestBackgroundPermissionsAsync();
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 0,
        deferredUpdatesInterval: 0,
        deferredUpdatesDistance: 0,
      });
    }
  };
  TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
      // Error occurred - check `error.message` for more details.
      return;
    }
    if (data) {
      const { locations } = data;
      console.log(data);
      // do something with the locations captured in the background
    }
  });

  const riderOrders = useSelector((state) => state.orders.riderOrders);

  const i = riderOrders.data;

  // Find Order By Id
  const result = i.filter((item) => item.id === Number(id));
  const [
    {
      attributes: { status },
    },
  ] = result;

  if (status === "Accepted") {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <View>
          <Text>Order Id{id}</Text>
          <Text>{address}</Text>
          <Text>{building}</Text>
          <Text>{status}</Text>
          <Text>distance{distance}</Text>
          <Text>Complete Your Order</Text>
        </View>
        <Button
          title="Start your Delivery"
          // change status to Delivering
          onPress={() => startDelivering()}
        />
      </SafeAreaView>
    );
  }
  if (status === "Delivering") {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <View>
          {isDriverClose ? (
            <Text style={{ color: "green" }}>Close</Text>
          ) : (
            <Text style={{ color: "blue" }}>Not Close</Text>
          )}
        </View>
        <View>
          <Text>Order Id{id}</Text>
          <Text>{address}</Text>
          <Text>{building}</Text>
          <Text>{status}</Text>
          <Text>distance{distance}</Text>

          <Text>Complete Your Order</Text>
        </View>
        <Button title="Delivering" />
      </SafeAreaView>
    );
  }
  if (status === "Arrived") {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <View>
          <Text>Order Id{id}</Text>
          <Text>{address}</Text>
          <Text>{building}</Text>
          <Text>{status}</Text>
          <Text>Complete Your Order</Text>
        </View>
        <Button title="Complete your Order" />
      </SafeAreaView>
    );
  }
  if (status === "Delivered") {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <View>
          <Text>Order Id{id}</Text>
          <Text>{address}</Text>
          <Text>{building}</Text>
          <Text>{status}</Text>
          <Text>Complete Your Order</Text>
        </View>
        <Button title="Find More Orders" />
      </SafeAreaView>
    );
  }
};

export default NavigatetoApp;

const styles = StyleSheet.create({});
