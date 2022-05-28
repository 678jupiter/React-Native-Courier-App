import { useRef, useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
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

const order = orders[0];

const restaurantLocation = {
  latitude: order.Restaurant.lat,
  longitude: order.Restaurant.lng,
};

const OrderDelivery = ({ route, navigation }) => {
  const { id } = route.params;
  const { latitude } = route.params;
  const { longitude } = route.params;
  const { address } = route.params;
  const { building } = route.params;
  //const { status } = route.params;
  const { Odishes } = route.params;
  const [status, setStatus] = useState("Ready");
  console.log(latitude, longitude);
  // const deliveryLocation = {
  //   latitude,
  //   longitude,
  // };
  const deliveryLocation = {
    latitude: -1.2529133,
    longitude: 36.715615,
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
  // useEffect(() => {
  //   getCurrentOrderById();
  // });

  const Accepted = () => {
    axios
      .put(`https://myfoodcms189.herokuapp.com/api/restaurant-orders/${id}`, {
        data: {
          status: "Accepted",
        },
      })
      .then(function (response) {
        console.log(response);
        setDeliveryStatus(ORDER_STATUSES.ACCEPTED);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const PickedUp = () => {
    axios
      .put(`https://myfoodcms189.herokuapp.com/api/restaurant-orders/${id}`, {
        data: {
          status: "PickedUp",
        },
      })
      .then(function (response) {
        console.log(response);
        setDeliveryStatus(ORDER_STATUSES.ACCEPTED);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const Delivering = () => {
    axios
      .put(`https://myfoodcms189.herokuapp.com/api/restaurant-orders/${id}`, {
        data: {
          status: "Delivering",
        },
      })
      .then(function (response) {
        console.log(response);
        setDeliveryStatus(ORDER_STATUSES.ACCEPTED);
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
        distanceInterval: 100,
      },
      (updatedLocation) => {
        setDriverLocation({
          latitude: updatedLocation.coords.latitude,
          longitude: updatedLocation.coords.longitude,
        });
        axios
          .put(
            `https://myfoodcms189.herokuapp.com/api/restaurant-orders/${id}`,
            {
              data: {
                courierLat: JSON.stringify(updatedLocation.coords.latitude),
                courierLng: JSON.stringify(updatedLocation.coords.longitude),
              },
            }
          )
          .then(function (response) {
            console.log("Updated");
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    );
    return foregroundSubscription;
  }, []);

  if (!driverLocation) {
    return <ActivityIndicator size={"large"} />;
  }
  //console.log(driverLocation);
  const onButtonpressed = () => {
    if (status === "Ready") {
      bottomSheetRef.current?.collapse();
      mapRef.current.animateToRegion({
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      // Accepted();
      setStatus("Accepted");
    }
    if (deliveryStatus === "Accepted") {
      bottomSheetRef.current?.collapse();
      setDeliveryStatus(ORDER_STATUSES.PICKED_UP);
    }
    if (status === "PickedUp") {
      bottomSheetRef.current?.collapse();
      navigation.goBack();
      console.warn("Delivery Finished");
    }
  };
  console.log(status);

  const renderButtonTitle = () => {
    if (status === "Ready") {
      return "Accept Order";
    }
    if (status === "Accepted") {
      return "Pick-Up Order";
    }
    if (status === "PickedUp") {
      return "Complete Delivery";
    }
  };

  const isButtonDisabled = () => {
    if (status === "Ready") {
      return false;
    }
    if ((status === "ACCEPTED" || status === "PickedUp") && isDriverClose) {
      return false;
    }

    return true;
  };

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
            status === "Ready" ? restaurantLocation : deliveryLocation
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
            latitude: order.Restaurant.lat,
            longitude: order.Restaurant.lng,
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
          title={order.User.name}
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
          <Text style={styles.buttonText}>{renderButtonTitle()}</Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
};

export default OrderDelivery;
