import { useRef, useMemo, useEffect } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import MapView, { Marker } from "react-native-maps";
import { Entypo } from "@expo/vector-icons";
import { gql } from "@apollo/client";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../../../Redux/orderActions";
import { colors } from "../../../config";

const GET_READY_ORDERS = gql`
  {
    restaurantOrders {
      data {
        id
        attributes {
          status
          userName
          Latitude
          Longitude
          address
          buildinginfo
          users_permissions_users {
            data {
              id
              attributes {
                mobileNumber
              }
            }
          }
        }
      }
    }
  }
`;

const OrdersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const riderOrders = useSelector((state) => state.orders.riderOrders);

  // console.log(result);
  const bottomSheetRef = useRef(null);
  const { width, height } = useWindowDimensions();

  const snapPoints = useMemo(() => ["12%", "95%"], []);

  if (riderOrders.length === 0) {
    return (
      <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
        <ActivityIndicator size="large" color={colors.colors} />
      </View>
    );
  }
  if (riderOrders) {
    const i = riderOrders.data;
    const result = i.filter((item) => item.attributes.status === "Ready");
    return (
      <View style={{ backgroundColor: "lightblue", flex: 1 }}>
        <MapView
          style={{
            height,
            width,
          }}
          showsUserLocation
          followsUserLocation
        >
          {riderOrders.map((order) => (
            <Marker
              key={order.id}
              title={order.Restaurant.name}
              description={order.Restaurant.address}
              coordinate={{
                latitude: order.Restaurant.lat,
                longitude: order.Restaurant.lng,
              }}
            >
              <View
                style={{
                  backgroundColor: "green",
                  padding: 5,
                  borderRadius: 20,
                }}
              >
                <Entypo name="shop" size={24} color="white" />
              </View>
            </Marker>
          ))}
        </MapView>

        <BottomSheet index={1} ref={bottomSheetRef} snapPoints={snapPoints}>
          <View style={{ alignItems: "center", marginBottom: 30 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                letterSpacing: 0.5,
                paddingBottom: 5,
              }}
            >
              You're Online
            </Text>
            <Text style={{ letterSpacing: 0.5, color: "grey" }}>
              Available Orders: {i.length}
            </Text>
          </View>
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
                    onPress={() =>
                      navigation.navigate("OrdersDeliveryScreen", {
                        id: `${item.id}`,
                        latitude: `${item.attributes.Latitude}`,
                        longitude: `${item.attributes.Longitude}`,
                        address: `${item.attributes.address}`,
                        building: `${item.attributes.buildinginfo}`,
                        status: `${item.attributes.status}`,

                        // console.log(item.attributes.Latitude)
                      })
                    }
                  >
                    {/* <Image
              source={{ uri: order.Restaurant.image }}
              style={{
                width: "25%",
                height: "100%",
                borderBottomLeftRadius: 10,
                borderTopLeftRadius: 10,
              }}
            /> */}
                    <View
                      style={{ flex: 1, marginLeft: 10, paddingVertical: 5 }}
                    >
                      <Text style={{ fontSize: 18, fontWeight: "500" }}>
                        order.Restaurant.name
                      </Text>
                      <Text style={{ color: "grey" }}>
                        order.Restaurant.address
                      </Text>

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
