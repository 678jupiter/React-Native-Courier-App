import { useRef, useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
  Platform,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  FontAwesome5,
  Fontisto,
  AntDesign,
  Entypo,
  Ionicons,
} from "@expo/vector-icons";
import orders from "../../../assets/data/orders.json";
import styles from "./styles";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import axios from "axios";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
const STATUS_TO_TITLE = {
  Ready: "Accept Order",
  Accepted: "Pick-Up Order",
  PickedUp: "Complete Delivery",
};

const order = orders[0];

const OrderDelivery = ({ route, navigation }) => {
  const userData = useSelector((state) => state.user.usermeta);

  const authAxios = axios.create({
    baseURL: "http://localhost:1337/api/",
    headers: {
      Authorization: `Bearer ${userData.jwt}`,
    },
  });
  const socket = io("http://localhost:4000");

  function showRoom() {
    console.log("Joined Room");
  }
  useEffect(() => {
    const input = id;
    socket.emit("enter_room", input, showRoom);
  }, []);

  const { id } = route.params;
  const { customerLatitude } = route.params;
  const { customerLongitude } = route.params;
  const { address } = route.params;
  const { building } = route.params;
  //const { status } = route.params;
  const { Odishes } = route.params;
  const [status, setStatus] = useState("Ready");
  const deliveryLocation = {
    // latitude: customerLatitude,
    //longitude: customerLongitude,
    latitude: -1.2519106,
    longitude: 36.6946812,
  };
  const restaurantLocation = {
    // latitude: -1.26471,
    //longitude: 36.8015,
    latitude: -1.2519106,
    longitude: 36.6946812,
  };

  const getCurrentOrderById = () => {
    axios
      .get(`https://myfoodcms189.herokuapp.com/api/restaurant-orders/${id}`, {})
      .then(function (res) {
        // console.log(res.data);
        const {
          data: {
            attributes: { status },
          },
        } = res.data;
        console.log(status);
        setStatus(status);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  useEffect(() => {
    let isCancelled = false;
    // getCurrentOrderById();
    return () => {
      isCancelled = true;
    };
  });

  const Accepted = () => {
    authAxios
      .put(`restaurant-orders/${id}`, {
        data: {
          status: "Accepted",
        },
      })
      .then(function (response) {
        console.log(response);
        //  setDeliveryStatus(ORDER_STATUSES.ACCEPTED);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const PickedUp = () => {
    authAxios
      .put(`restaurant-orders/${id}`, {
        data: {
          status: "PickedUp",
        },
      })
      .then(function (response) {
        console.log(response);
        //setDeliveryStatus(ORDER_STATUSES.ACCEPTED);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const Delivering = () => {
    authAxios
      .put(`restaurant-orders/${id}`, {
        data: {
          status: "Delivering",
        },
      })
      .then(function (response) {
        console.log(response);
        //  setDeliveryStatus(ORDER_STATUSES.ACCEPTED);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const completeOrder = () => {
    authAxios
      .put(`restaurant-orders/${id}`, {
        data: {
          status: "Delivered",
        },
      })
      .then(function (response) {
        console.log(response);
        // setDeliveryStatus(ORDER_STATUSES.ACCEPTED);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const ORDER_STATUSES = {
    READY_FOR_PICKUP: "READY_FOR_PICKUP",
    ACCEPTED: "ACCEPTED",
    PICKED_UP: "PICKED_UP",
  };

  const [driverLocation, setDriverLocation] = useState(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState(
    ORDER_STATUSES.READY_FOR_PICKUP
  );
  const [isDriverClose, setIsDriverClose] = useState(false);
  console.log(driverLocation);

  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);
  const { width, height } = useWindowDimensions();

  const snapPoints = useMemo(() => ["12%", "95%"], []);

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
        // axios
        //   .put(
        //     `https://myfoodcms189.herokuapp.com/api/restaurant-orders/${id}`,
        //     {
        //       data: {
        //         courierLat: JSON.stringify(updatedLocation.coords.latitude),
        //         courierLng: JSON.stringify(updatedLocation.coords.longitude),
        //       },
        //     }
        //   )
        //   .then(function (response) {
        //     console.log("Updated");
        //   })
        //   .catch(function (error) {
        //     console.log(error);
        //   });
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

  if (!driverLocation) {
    return <ActivityIndicator size={"large"} />;
  }
  //console.log(driverLocation);
  const onButtonpressed = async () => {
    console.log("Pressed");
    if (status === "Ready") {
      bottomSheetRef.current?.collapse();
      mapRef.current.animateToRegion({
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      Accepted();
      setStatus("Accepted");
      //await sendPushNotification(expoPushToken);
    } else if (status === "Accepted") {
      bottomSheetRef.current?.collapse();
      setStatus("PickedUp");
      PickedUp();
    }
    if (status === "PickedUp") {
      bottomSheetRef.current?.collapse();
      //PickedUp();
      navigation.goBack();
      console.warn("Delivery Finished");
    }
    if (status === "PickedUp") {
      completeOrder();
      bottomSheetRef.current?.collapse();
      navigation.goBack();
    }
  };
  console.log(status);

  const renderButtonTitle = () => {
    if (status === "Ready") {
      return false;
    }
    if ((status === "Accepted" || status === "PickedUp") && isDriverClose) {
      return false;
    }
    if (status === "PickedUp") {
      return "Complete Delivery";
    }
    return true;
  };

  const isButtonDisabled = () => {
    if (status === "Ready") {
      return false;
    }
    if (status === "Accepted" && isDriverClose) {
      return false;
    }
    if (status === "PickedUp" && isDriverClose) {
      return false;
    }

    return true;
  };
  if (!driverLocation) {
    return <ActivityIndicator size={"large"} />;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={{ width, height }}
        showsUserLocation
        followsUserLocation
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.07,
          longitudeDelta: 0.07,
        }}
      >
        {/* <MapViewDirections
          origin={driverLocation}
          destination={
            status === "Accepted" ? restaurantLocation : deliveryLocation
          }
          strokeWidth={10}
          waypoints={status === "Ready" ? [restaurantLocation] : []}
          strokeColor="#3FC060"
          apikey={"AIzaSyDtiFFwZ-LI0PT8ehVGFb42mefaC-bOLfI"}
          onReady={(result) => {
            setIsDriverClose(result.distance <= 0.1);
            setTotalMinutes(result.duration);
            setTotalKm(result.distance);
          }}
        /> */}
        <Marker
          coordinate={{
            latitude: restaurantLocation.latitude,
            longitude: restaurantLocation.longitude,
          }}
          title={order.Restaurant.name}
          description={order.Restaurant.address}
        >
          <View
            style={{ backgroundColor: "green", padding: 5, borderRadius: 20 }}
          >
            <Entypo name="shop" size={30} color="white" />
          </View>
        </Marker>
        <Marker
          coordinate={{
            latitude: Number(deliveryLocation.latitude),
            longitude: Number(deliveryLocation.longitude),
          }}
          title="customer"
          description={order.User.address}
        >
          <View
            style={{ backgroundColor: "green", padding: 5, borderRadius: 20 }}
          >
            <AntDesign name="user" size={24} color="white" />
          </View>
        </Marker>

        {/* <Marker
          coordinate={{
            latitude: Number(latitude),
            longitude: Number(longitude),
          }}
          title={order.User.name}
          description={order.User.address}
        >
          <View
            style={{ backgroundColor: "green", padding: 5, borderRadius: 20 }}
          >
            <AntDesign name="user" size={24} color="white" />
          </View>
        </Marker> */}
      </MapView>
      {status === "Ready" && (
        <Ionicons
          onPress={() => navigation.goBack()}
          name="arrow-back-circle"
          size={45}
          color="black"
          style={{ top: 40, left: 15, position: "absolute" }}
        />
      )}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.handleIndicatorContainer}>
          <Text style={styles.routeDetailsText}>
            {totalMinutes.toFixed(0)} min
          </Text>
          <FontAwesome5
            name="shopping-bag"
            size={30}
            color="#3FC060"
            style={{ marginHorizontal: 10 }}
          />
          <Text style={styles.routeDetailsText}>{totalKm.toFixed(2)} km</Text>
        </View>
        <View style={styles.deliveryDetailsContainer}>
          {Odishes.map((item) => (
            <View key={item.id}>
              <Text style={styles.restaurantName}>{item.restaurantName}</Text>
              <View style={styles.adressContainer}>
                <Fontisto name="shopping-store" size={22} color="grey" />
                <Text style={styles.adressText}>{item.restaurantAddress}</Text>
              </View>
              <View style={styles.adressContainer}>
                <FontAwesome5 name="map-marker-alt" size={30} color="grey" />
                <Text style={styles.adressText}>{address}</Text>
              </View>
              <View style={styles.orderDetailsContainer}>
                <View>
                  <Text style={styles.orderItemText}>{item.name}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <Pressable
          style={{
            ...styles.buttonContainer,
            backgroundColor: isButtonDisabled() ? "grey" : "#3FC060",
          }}
          onPress={onButtonpressed}
          disabled={isButtonDisabled()}
        >
          <Text style={styles.buttonText}>{STATUS_TO_TITLE[status]}</Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
};

export default OrderDelivery;
