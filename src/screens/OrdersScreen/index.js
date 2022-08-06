import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
  StyleSheet,
} from "react-native";
import { gql, useQuery } from "@apollo/client";
import Pressable from "react-native/Libraries/Components/Pressable/Pressable";
import { useDispatch, useSelector } from "react-redux";
import { colors, secondaryColor } from "../../../config";
import axios from "axios";
import noNetworkImg from "../../../assets/images/noNetwork.png";
import { Button } from "../../../components/atoms";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { getPreciseDistance } from "geolib";
import { resActions } from "../../../Redux/myRestSlice";

const GET_MY_JOBS = gql`
  query ($id: ID!) {
    courier(id: $id) {
      data {
        id
        attributes {
          restaurant_order {
            data {
              id
              attributes {
                userName
                dishes
                address
                Latitude
                Longitude
                customermobilenumber
                buildinginfo
                Flat
                status
              }
            }
          }
        }
      }
    }
  }
`;

const OrdersScreen = ({ navigation }) => {
  const isActivated = useSelector((state) => state.active.isActive);
  const token = useSelector((state) => state.token.userToken);
  const courierData = useSelector((state) => state.cur.curmeta);
  const restaurantData = useSelector((state) => state.myres.aboutRes);
  const dispatch = useDispatch();

  const authAxios = axios.create({
    baseURL: "https://myfoodcms189.herokuapp.com/api/",
    headers: {
      Authorization: `Bearer ${token.jwt}`,
    },
  });
  const getRestaurantLocation = async () => {
    await authAxios
      .get(`my-restaurants/1`)
      .then((res) => {
        const {
          data: {
            attributes: {
              Latitude,
              Longitude,
              ppkm,
              tN,
              name,
              restaurantMobileN,
            },
          },
        } = res.data;
        dispatch(
          resActions.addRes({
            rLat: Latitude,
            rLng: Longitude,
            rppkem: ppkm,
            tnn: tN,
            rname: name,
            rmn: restaurantMobileN,
          })
        );
        getRequestForLoc(Latitude, Longitude);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      console.log("UseEffect");
      getRestaurantLocation();
      return () => {
        isActive = false;
      };
    }, [navigation])
  );

  const getRequestForLoc = async (Latitude, Longitude) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }
    if (status === "granted") {
      let location = await Location.getCurrentPositionAsync({});
      let myLatitude = location.coords.latitude;
      let myLongitude = location.coords.longitude;
      var pdis = getPreciseDistance(
        {
          latitude: Number(Latitude),
          longitude: Number(Longitude),
        },
        {
          latitude: Number(myLatitude),
          longitude: Number(myLongitude),
        }
      );
      console.log(pdis);
      updateCourierDistance(Number(pdis / 1000));
    }
  };

  const updateCourierDistance = async (item) => {
    console.log(item);
    await authAxios
      .put(`couriers/${courierData.cid} `, {
        data: {
          distanceFromRestaurant: Number(item),
        },
      })
      .then((res) => {
        console.log(
          "Updated courier distance betwwen restaurant and Cur Redux"
        );
      })
      .catch((error) => {
        console.log(`distance between update failed ${error}`);
      });
  };

  const AlertButton = (item, restaurant_order) =>
    Alert.alert("Accept Order", "", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      { text: "OK", onPress: () => AcceptOder(item, restaurant_order) },
    ]);

  const AcceptOder = async (item, restaurant_order) => {
    await authAxios
      .put(`restaurant-orders/${item}`, {
        data: {
          status: "Accepted",
        },
      })
      .then(function (res) {
        console.log(res.data);
        const {
          data: {
            attributes: {
              Flat,
              dishes,
              Latitude,
              Longitude,
              address,
              buildinginfo,
              status,
              customermobilenumber,
              userName,
            },
          },
        } = res.data;
        navigation.navigate("OrdersDeliveryScreen2", {
          Odishes: dishes,
          id: `${item}`,
          customerLatitude: `${Latitude}`,
          customerLongitude: `${Longitude}`,
          address: `${address}`,
          building: `${buildinginfo}`,
          status: `${status}`,
          customermobilenumber: customermobilenumber,
          customerName: userName,
          Flat: Flat,
          restaurantDataName: restaurantData.rname,
        });
      })
      .catch(function (error) {
        console.log(`Accept order Failed${error.message}`);
      });
  };
  const continueWth = (item) => {
    const {
      data: {
        id,
        attributes: {
          Flat,
          address,
          buildinginfo,
          customermobilenumber,
          dishes,
          Latitude,
          Longitude,
          status,
          userName,
        },
      },
    } = item;
    console.log(id);

    navigation.navigate("OrdersDeliveryScreen2", {
      Odishes: dishes,
      id: `${id}`,
      customerLatitude: `${Latitude}`,
      customerLongitude: `${Longitude}`,
      address: `${address}`,
      building: `${buildinginfo}`,
      status: `${status}`,
      customermobilenumber: customermobilenumber,
      customerName: userName,
      Flat: Flat,
      restaurantDataName: restaurantData.rname,
    });
  };
  const id = courierData.cid;
  const { loading, error, data, refetch } = useQuery(GET_MY_JOBS, {
    variables: { id },
  });
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      refetch();
      return () => {
        isActive = false;
      };
    }, [navigation])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.activity}>
          <ActivityIndicator size="large" color={secondaryColor} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    console.log(`Failure @ GQL${error.message}`);
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
            backgroundColor: colors.light_gray,

            //alignItems: "stretch",
            //margin: 20,
          }}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={styles.networkTitle}>No Internet connection.</Text>
            <Text style={styles.networkText}>
              Please check your internet connection and then refresh the page.
            </Text>
          </View>
          <View>
            <Image source={noNetworkImg} style={{ width: 305, height: 159 }} />
          </View>
          <View>
            <Button
              label="Refresh"
              radius={10}
              txtSize={14}
              padSizeY={28}
              bgColor={colors.slate}
              padSizeX={14}
              borderWidth={0}
              fontFam="CircularStdBold"
              txtDecorationLine="none"
              onPress={() => refetch()}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (data) {
    //console.log(data);
    const {
      courier: {
        data: {
          attributes: { restaurant_order },
        },
      },
    } = data;
    //console.log(restaurant_order);

    if (restaurant_order.data === null) {
      return (
        <SafeAreaView style={styles.safeContainer}>
          <View style={{ flex: 1, paddingTop: 20 }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                {restaurantData.rname}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20 }}>
                You have no jobs at the moment.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    if (restaurant_order.data.attributes.status === "Ready") {
      return (
        <SafeAreaView style={styles.safeContainer}>
          <View style={{ flex: 1, paddingTop: 20 }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                {restaurantData.rname}
              </Text>
            </View>
            <View style={{ flex: 0.5 }}>
              <Pressable
                style={{
                  flexDirection: "row",
                  margin: 10,
                  borderColor: "#3FC060",
                  borderWidth: 2,
                  borderRadius: 12,
                }}
                onPress={() =>
                  AlertButton(restaurant_order.data.id, restaurant_order)
                }
              >
                <View style={{ flex: 1, marginLeft: 10, paddingVertical: 5 }}>
                  <Text style={{ color: "orange" }}>
                    {restaurant_order.data.attributes.status}
                  </Text>
                  <Text style={{ marginTop: 10, color: "black" }}>
                    Delivery Details:
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Customer Name:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.userName}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Building:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.buildinginfo}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Flat:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.Flat}
                    </Text>
                  </View>
                  <Text style={{ marginTop: 10, color: "black" }}>
                    Food details:
                  </Text>
                  {restaurant_order.data.attributes.dishes.map((dish) => (
                    <View key={dish.id}>
                      <Text style={{ color: "grey" }}>
                        {dish.attributes.dishName}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            </View>

            <View style={{ marginLeft: 10, marginRight: 10 }}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() =>
                  AlertButton(restaurant_order.data.id, restaurant_order)
                }
              >
                <Text style={styles.textStyle}>Accept delivery</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      );
    }
    if (restaurant_order.data.attributes.status === "Accepted") {
      return (
        <SafeAreaView style={styles.safeContainer}>
          <View style={{ flex: 1, paddingTop: 20 }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                {restaurantData.rname}
              </Text>
            </View>
            <View style={{ flex: 0.5 }}>
              <Pressable
                style={{
                  flexDirection: "row",
                  margin: 10,
                  borderColor: "#3FC060",
                  borderWidth: 2,
                  borderRadius: 12,
                }}
                //  onPress={() => continueWth(restaurant_order)}
              >
                <View style={{ flex: 1, marginLeft: 10, paddingVertical: 5 }}>
                  <Text style={{ color: "orange" }}>
                    {restaurant_order.data.attributes.status}
                  </Text>
                  <Text style={{ marginTop: 10, color: "black" }}>
                    Delivery Details:
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Customer Name:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.userName}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Building:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.buildinginfo}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Flat:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.Flat}
                    </Text>
                  </View>
                  <Text style={{ marginTop: 10, color: "black" }}>
                    Food details:
                  </Text>
                  {restaurant_order.data.attributes.dishes.map((dish) => (
                    <View key={dish.id}>
                      <Text style={{ color: "grey" }}>
                        {dish.attributes.dishName}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            </View>

            <View style={{ marginLeft: 10, marginRight: 10 }}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => continueWth(restaurant_order)}
              >
                <Text style={styles.textStyle}>Continue with delivery</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      );
    }
    if (restaurant_order.data.attributes.status === "PickUp") {
      return (
        <SafeAreaView style={styles.safeContainer}>
          <View style={{ flex: 1, paddingTop: 20 }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                {restaurantData.rname}
              </Text>
            </View>
            <View style={{ flex: 0.5 }}>
              <Pressable
                style={{
                  flexDirection: "row",
                  margin: 10,
                  borderColor: "#3FC060",
                  borderWidth: 2,
                  borderRadius: 12,
                }}
                //  onPress={() => continueWth(restaurant_order)}
              >
                <View style={{ flex: 1, marginLeft: 10, paddingVertical: 5 }}>
                  <Text style={{ color: "orange" }}>
                    {restaurant_order.data.attributes.status}
                  </Text>
                  <Text style={{ marginTop: 10, color: "black" }}>
                    Delivery Details:
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Customer Name:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.userName}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Building:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.buildinginfo}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Flat:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.Flat}
                    </Text>
                  </View>
                  <Text style={{ marginTop: 10, color: "black" }}>
                    Food details:
                  </Text>
                  {restaurant_order.data.attributes.dishes.map((dish) => (
                    <View key={dish.id}>
                      <Text style={{ color: "grey" }}>
                        {dish.attributes.dishName}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            </View>

            <View style={{ marginLeft: 10, marginRight: 10 }}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => continueWth(restaurant_order)}
              >
                <Text style={styles.textStyle}>Continue with delivery</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      );
    }
    if (restaurant_order.data.attributes.status === "Delivering") {
      return (
        <SafeAreaView style={styles.safeContainer}>
          <View style={{ flex: 1, paddingTop: 20 }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                {restaurantData.rname}
              </Text>
            </View>
            <View style={{ flex: 0.5 }}>
              <Pressable
                style={{
                  flexDirection: "row",
                  margin: 10,
                  borderColor: "#3FC060",
                  borderWidth: 2,
                  borderRadius: 12,
                }}
                //  onPress={() => continueWth(restaurant_order)}
              >
                <View style={{ flex: 1, marginLeft: 10, paddingVertical: 5 }}>
                  <Text style={{ color: "orange" }}>
                    {restaurant_order.data.attributes.status}
                  </Text>
                  <Text style={{ marginTop: 10, color: "black" }}>
                    Delivery Details:
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Customer Name:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.userName}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Building:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.buildinginfo}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Flat:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.Flat}
                    </Text>
                  </View>
                  <Text style={{ marginTop: 10, color: "black" }}>
                    Food details:
                  </Text>
                  {restaurant_order.data.attributes.dishes.map((dish) => (
                    <View key={dish.id}>
                      <Text style={{ color: "grey" }}>
                        {dish.attributes.dishName}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            </View>

            <View style={{ marginLeft: 10, marginRight: 10 }}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => continueWth(restaurant_order)}
              >
                <Text style={styles.textStyle}>Continue with delivery</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      );
    }
    if (restaurant_order.data.attributes.status === "Arrived") {
      return (
        <SafeAreaView style={styles.safeContainer}>
          <View style={{ flex: 1, paddingTop: 20 }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                {restaurantData.rname}
              </Text>
            </View>
            <View style={{ flex: 0.5 }}>
              <Pressable
                style={{
                  flexDirection: "row",
                  margin: 10,
                  borderColor: "#3FC060",
                  borderWidth: 2,
                  borderRadius: 12,
                }}
                //  onPress={() => continueWth(restaurant_order)}
              >
                <View style={{ flex: 1, marginLeft: 10, paddingVertical: 5 }}>
                  <Text style={{ color: "orange" }}>
                    {restaurant_order.data.attributes.status}
                  </Text>
                  <Text style={{ marginTop: 10, color: "black" }}>
                    Delivery Details:
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Customer Name:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.userName}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Building:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.buildinginfo}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      Flat:
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "500",
                        color: "black",
                        width: "50%",
                      }}
                    >
                      {restaurant_order.data.attributes.Flat}
                    </Text>
                  </View>
                  <Text style={{ marginTop: 10, color: "black" }}>
                    Food details:
                  </Text>
                  {restaurant_order.data.attributes.dishes.map((dish) => (
                    <View key={dish.id}>
                      <Text style={{ color: "grey" }}>
                        {dish.attributes.dishName}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            </View>

            <View style={{ marginLeft: 10, marginRight: 10 }}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => continueWth(restaurant_order)}
              >
                <Text style={styles.textStyle}>Finish Delivery</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    if (restaurant_order.data.attributes.status === "Delivered") {
      return (
        <SafeAreaView style={styles.safeContainer}>
          <View style={{ flex: 1, paddingTop: 20 }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                {restaurantData.rname}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20 }}>
                You have no jobs at the moment.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      );
    } else {
      return (
        <SafeAreaView style={styles.safeContainer}>
          <View style={{ flex: 1, paddingTop: 20 }}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  fontStyle: "italic",
                }}
              >
                {restaurantData.rname}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20 }}>You have no jobs Available.</Text>
            </View>
          </View>
        </SafeAreaView>
      );
    }
  }
};

export default OrdersScreen;
const styles = StyleSheet.create({
  activity: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  networkText: {
    fontFamily: "CircularStdBook",
    fontSize: 16,
    lineHeight: 25,
  },
  networkTitle: {
    fontFamily: "CircularStdBold",
    fontSize: 24,
    marginBottom: 0,
  },
  safeContainer: { backgroundColor: colors.light_gray, flex: 1 },
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
