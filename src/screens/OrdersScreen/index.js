import React, { useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Button,
} from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import MapView, { Marker } from "react-native-maps";
import { Entypo } from "@expo/vector-icons";
import { gql } from "@apollo/client";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../../Redux/orderActions";
import { colors } from "../../../config";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { activeOrderActions } from "../../../Redux/ActiveOrderSlice";

const OrdersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    let isCancelled = false;
    dispatch(fetchOrders());
    return () => {
      isCancelled = true;
    };
  }, [dispatch]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     dispatch(fetchOrders());
  //   }, [])
  // );
  const riderOrders = useSelector((state) => state.orders.riderOrders);
  const isActivated = useSelector((state) => state.active.isActive);
  const bottomSheetRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const snapPoints = useMemo(() => ["12%", "95%"], []);
  const token = useSelector((state) => state.token.userToken);
  const AlertButton = (item) =>
    Alert.alert("Accept Order", "", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      { text: "OK", onPress: () => AcceptOder(item) },
    ]);
  const authAxios = axios.create({
    baseURL: "https://myfoodcms189.herokuapp.com/api/",
    headers: {
      Authorization: `Bearer ${token.jwt}`,
    },
  });
  const AcceptOder = async (item) => {
    await authAxios
      .put(`restaurant-orders/${item.id}`, {
        data: {
          status: "Accepted",
        },
      })
      .then(function (response) {
        console.log("res");
        dispatch(activeOrderActions.active());
        navigation.navigate("OrdersDeliveryScreen2", {
          Odishes: item.attributes.dishes,
          id: `${item.id}`,
          customerLatitude: `${item.attributes.Latitude}`,
          customerLongitude: `${item.attributes.Longitude}`,
          address: `${item.attributes.address}`,
          building: `${item.attributes.buildinginfo}`,
          status: `${item.attributes.status}`,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const changeActiveStatus = () => {
    console.log(`Changing from ${isActivated}`);
    if (isActivated === true) {
      dispatch(activeOrderActions.notActive());
    }
    if (isActivated === false) {
      dispatch(activeOrderActions.active());
    }
  };

  if (riderOrders.length === 0) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
        <ActivityIndicator size="large" color={colors.colors} />
      </View>
    );
  }
  const i = riderOrders.data;

  // if isActivated is false
  const result = i.filter((item) => item.attributes.status === "Ready");

  // if isActivated is true
  const Acc_Orders = i.filter(
    (item) =>
      item.attributes.status === "Accepted" ||
      item.attributes.status === "Delivering"
  );
  if (result.length !== 0) {
    const [
      {
        attributes: { dishes },
      },
    ] = result;
    return (
      <View style={{ backgroundColor: "lightblue", flex: 1 }}>
        {/* {ACTIVE_ORDERS} */}
        <View style={{ marginTop: 30 }}>
          <Button
            title="Change Active Status"
            onPress={() => changeActiveStatus()}
          />
        </View>

        {isActivated ? (
          <BottomSheet index={1} ref={bottomSheetRef} snapPoints={snapPoints}>
            <View style={{ alignItems: "center", marginBottom: 30 }}>
              {isActivated ? <Text>Active</Text> : <Text>Not Active</Text>}
              {/* <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                  paddingBottom: 5,
                }}
              >
                You're Online
              </Text> */}
              <Text style={{ letterSpacing: 0.5, color: "grey" }}>
                Available Orders: {result.length}
              </Text>
            </View>
            {Acc_Orders ? (
              <BottomSheetFlatList
                data={Acc_Orders}
                renderItem={({ item }) => {
                  return (
                    <Pressable
                      style={{
                        flexDirection: "row",
                        margin: 10,
                        borderColor: "#3FC060",
                        borderWidth: 2,
                        borderRadius: 12,
                      }}
                      onPress={() =>
                        navigation.navigate("OrdersDeliveryScreen2", {
                          Odishes: item.attributes.dishes,
                          id: `${item.id}`,
                          customerLatitude: `${item.attributes.Latitude}`,
                          customerLongitude: `${item.attributes.Longitude}`,
                          address: `${item.attributes.address}`,
                          building: `${item.attributes.buildinginfo}`,
                          status: `${item.attributes.status}`,
                        })
                      }
                    >
                      <View
                        style={{ flex: 1, marginLeft: 10, paddingVertical: 5 }}
                      >
                        <Text style={{ color: "orange" }}>
                          {item.attributes.status}
                        </Text>
                        <Text style={{ color: "red" }}>
                          COMPLETE YOUR ORDER
                        </Text>
                        {dishes.map((dish) => (
                          <View key={dish.id}>
                            <Text style={{ fontSize: 18, fontWeight: "500" }}>
                              {dish.restaurantName} restaurant name
                            </Text>
                            <Text style={{ color: "grey" }}>
                              {dish.restaurantAddress}
                            </Text>
                          </View>
                        ))}

                        <Text style={{ marginTop: 10 }}>Delivery Details:</Text>
                        <Text style={{ color: "grey" }}>
                          {item.attributes.userName}
                        </Text>
                        <Text style={{ color: "grey" }}>
                          {item.attributes.address}
                        </Text>
                        <Text style={{ color: "grey" }}>
                          {item.attributes.buildinginfo}
                        </Text>
                      </View>

                      <View
                        style={{
                          padding: 5,
                          backgroundColor: "#3FC060",
                          borderBottomRightRadius: 10,
                          borderTopRightRadius: 10,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Entypo
                          name="check"
                          size={30}
                          color="white"
                          style={{ marginLeft: "auto" }}
                        />
                      </View>
                    </Pressable>
                  );
                }}
              />
            ) : (
              <Text>No Orders</Text>
            )}
          </BottomSheet>
        ) : (
          <BottomSheet index={1} ref={bottomSheetRef} snapPoints={snapPoints}>
            <View style={{ alignItems: "center", marginBottom: 30 }}>
              {isActivated ? <Text>Active</Text> : <Text>Not Active</Text>}

              {/* <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                  paddingBottom: 5,
                }}
              >
                You're Online
              </Text> */}
              <Text style={{ letterSpacing: 0.5, color: "grey" }}>
                Available Orders: {result.length}
              </Text>
            </View>

            {/* {READY_ORDERS} */}
            {result ? (
              <BottomSheetFlatList
                data={result}
                renderItem={({ item }) => {
                  return (
                    <Pressable
                      style={{
                        flexDirection: "row",
                        margin: 10,
                        borderColor: "#3FC060",
                        borderWidth: 2,
                        borderRadius: 12,
                      }}
                      onPress={() => AlertButton(item)}
                    >
                      <View
                        style={{ flex: 1, marginLeft: 10, paddingVertical: 5 }}
                      >
                        <Text style={{ color: "green" }}>
                          {item.attributes.status}
                        </Text>
                        {dishes.map((dish) => (
                          <View key={dish.id}>
                            <Text style={{ fontSize: 18, fontWeight: "500" }}>
                              {dish.restaurantName} restaurant Name
                            </Text>
                            <Text style={{ color: "grey" }}>
                              {dish.restaurantAddress} restaurant Address
                            </Text>
                          </View>
                        ))}

                        <Text style={{ marginTop: 10 }}>Delivery Details:</Text>
                        <Text style={{ color: "grey" }}>
                          {item.attributes.userName}
                        </Text>
                        <Text style={{ color: "grey" }}>
                          {item.attributes.address}
                        </Text>
                        <Text style={{ color: "grey" }}>
                          {item.attributes.buildinginfo}
                        </Text>
                      </View>
                      <View
                        style={{
                          padding: 5,
                          backgroundColor: "#3FC060",
                          borderBottomRightRadius: 10,
                          borderTopRightRadius: 10,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Entypo
                          name="check"
                          size={30}
                          color="white"
                          style={{ marginLeft: "auto" }}
                        />
                      </View>
                    </Pressable>
                  );
                }}
              />
            ) : (
              <Text>No Orders</Text>
            )}
          </BottomSheet>
        )}
      </View>
    );
  } else {
    return (
      <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
        <Text>No jobs.</Text>
      </View>
    );
  }
};

export default OrdersScreen;
