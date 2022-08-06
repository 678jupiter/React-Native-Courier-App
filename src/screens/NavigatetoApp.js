import {
  Alert,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Image,
  Modal,
  ImageBackground,
} from "react-native";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { getPreciseDistance } from "geolib";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { gql, useQuery } from "@apollo/client";
import { colors, secondaryColor } from "../../config";
import noNetworkImg from "../../assets/images/noNetwork.png";
import { Button } from "../../components/atoms";
import call from "react-native-phone-call";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import { MaterialIcons } from "@expo/vector-icons";
const GET_JOB_STATUS = gql`
  query ($id: ID!) {
    restaurantOrder(id: $id) {
      data {
        id
        attributes {
          status
        }
      }
    }
  }
`;
const NavigatetoApp = ({ route, navigation }) => {
  const {
    id,
    customerLatitude,
    address,
    building,
    customerLongitude,
    customermobilenumber,
    Flat,
    customerName,
    restaurantDataName,
  } = route.params;
  //const { status } = route.params;
  const { Odishes } = route.params;
  const [init, setInite] = useState(0);
  const [driverLocation, setDriverLocation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [distance, setDistance] = useState();
  const [isDriverClose, setIsDriverClose] = useState(false);
  const restaurantData = useSelector((state) => state.myres.aboutRes);
  const token = useSelector((state) => state.token.userToken);
  const [imageUri, setImageUri] = useState("");
  const [loadingPickUp, setLoadingPickUp] = useState(false);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [loadingArrived, setLoadingArrived] = useState(false);
  const [takePhotoLoading, setTakePhotoLoading] = useState(false);
  const { loading, error, data, refetch } = useQuery(GET_JOB_STATUS, {
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
    const navigateToCustomer = () => {
      Linking.openURL(
        `google.navigation:q=${customerLatitude}+${customerLongitude}`
      );
    };
    const navigateToRestaurant = () => {
      Linking.openURL(
        `google.navigation:q=${Number(restaurantData.rLat)}+${Number(
          restaurantData.rLng
        )}`
      );
    };

    const authAxios = axios.create({
      baseURL: "https://myfoodcms189.herokuapp.com/api/",
      headers: {
        Authorization: `Bearer ${token.jwt}`,
      },
    });
    const authAxios2 = axios.create({
      baseURL: `https://myfoodcms189.herokuapp.com/api/`,
      headers: {
        Authorization: `Bearer ${token.jwt}`,
        "Content-Type": "multipart/form-data",
      },
    });
    const PickUp = async () => {
      setLoadingPickUp(true);
      await authAxios
        .put(`restaurant-orders/${id}`, {
          data: {
            status: "PickUp",
          },
        })
        .then(function (response) {
          refetch();
          console.log("res");
          requestPermissions();
          navigateToRestaurant();
          setLoadingPickUp(false);
        })
        .catch(function (error) {
          console.log(error);
          setLoadingPickUp(false);
        });
    };

    const AlertButton = () =>
      Alert.alert("Deliver to Customer", "", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => startDelivering() },
      ]);

    const startDelivering = async () => {
      setLoadingDelivery(true);
      await authAxios
        .put(`restaurant-orders/${id}`, {
          data: {
            status: "Delivering",
          },
        })
        .then(function () {
          refetch();
          console.log("res");
          // requestPermissions();
          navigateToCustomer();
          setLoadingDelivery(false);
        })
        .catch(function (error) {
          setLoadingDelivery(true);

          console.log(error);
        });
    };

    const AlertArrived = () =>
      Alert.alert("Have You Arrived?", "", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "Yes", onPress: () => Arrived() },
      ]);
    const Arrived = async () => {
      setLoadingArrived(true);
      await authAxios
        .put(`restaurant-orders/${id}`, {
          data: {
            status: "Arrived",
          },
        })
        .then(function () {
          refetch();
          console.log("res");
          console.log("close");
          setLoadingArrived(false);

          // TaskManager.unregisterAllTasksAsync();
          // dispatch(activeOrderActions.notActive());
        })
        .catch(function (error) {
          setLoadingArrived(false);

          console.log(error);
        });
    };

    const AlertDelivered = () =>
      Alert.alert(`Have You Delivered to ${customerName}?`, "", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "Yes", onPress: () => openModal() },
      ]);
    const Delivered = async () => {
      await authAxios
        .put(`restaurant-orders/${id}`, {
          data: {
            status: "Delivered",
          },
        })
        .then(function (response) {
          refetch();
          setTakePhotoLoading(false);
          setModalVisible(false);

          // TaskManager.unregisterAllTasksAsync();
          //dispatch(activeOrderActions.notActive());
        })
        .catch(function (error) {
          console.log(error);
        });
    };
    const openModal = () => {
      setModalVisible(true);
    };
    const captureImage = async () => {
      setTakePhotoLoading(true);
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        var uuri = result.uri;
        setImageUri(uuri);
        const newImageUri = "file:///" + uuri.split("file:/").join("");
        const formData = new FormData();

        formData.append("files", {
          uri: newImageUri,
          type: mime.getType(newImageUri),
          name: newImageUri.split("/").pop(),
        });
        authAxios2
          .post("upload", formData)
          .then((res) => {
            console.log("Done with Upload");
            const [
              {
                formats: {
                  medium: { url },
                },
              },
            ] = res.data;
            authAxios
              .put(`restaurant-orders/${id}`, {
                data: {
                  deliveryImage: url,
                },
              })
              .then((res) => {
                console.log("Done with Put");
                Delivered();
              })
              .catch((error) => {
                console.log(` update order image${error}`);
              });
          })
          .catch((error) => {
            console.log(`upload ${error}`);
          });
      }
    };
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

    // useEffect(() => {
    //   checkLocationStatus();
    // }, []);

    const LOCATION_TASK_NAME = "background-location-task";
    const requestPermissions = async () => {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      console.log(status);
      if (status === "granted") {
        // Location.requestBackgroundPermissionsAsync();
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          distanceInterval: 0,
          deferredUpdatesInterval: 0,
          deferredUpdatesDistance: 0,
          pausesUpdatesAutomatically: false,
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
        const [
          {
            coords: { latitude, longitude },
          },
        ] = locations;
        setDriverLocation({
          latitude: latitude,
          longitude: longitude,
        });
        authAxios
          .put(`restaurant-orders/${id}`, {
            data: {
              courierLat: JSON.stringify(latitude),
              courierLng: JSON.stringify(longitude),
            },
          })
          .then(function () {
            console.log("Updated");
          })
          .catch(function (error) {
            console.log(error);
          });
        let roomName = id;
        const inputM = {
          courierLat: JSON.stringify(latitude),
          courierLng: JSON.stringify(longitude),
        };
      }
    });

    // Find Order By Id

    const {
      restaurantOrder: {
        data: {
          attributes: { status },
        },
      },
    } = data;

    if (status === "Accepted") {
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.body}>
            <View style={styles.statusView}>
              <Text style={styles.statusText}>
                You Have Accepted The Delivery
              </Text>
            </View>
            <View style={styles.userNameView}>
              <View style={styles.secondUsernameView}>
                <Feather
                  name="user"
                  size={26}
                  color="black"
                  style={{ width: "10%" }}
                />
                <Text style={{ width: "50%" }}>{customerName}</Text>
              </View>
            </View>
            <View style={styles.addressView}>
              <View style={styles.secondAdrressView}>
                <Entypo
                  name="address"
                  size={26}
                  color="black"
                  style={{ width: "10%" }}
                />
                <Text style={{ width: "50%" }}>{address}</Text>
              </View>
            </View>

            <View style={styles.buildingView}>
              <View style={styles.secondBuildingView}>
                <FontAwesome
                  name="building"
                  size={26}
                  color="black"
                  style={{ width: "10%" }}
                />
                <Text style={{ width: "50%" }}>{building}</Text>
              </View>
            </View>

            <View style={styles.flatView}>
              <Text>{Flat}</Text>
            </View>

            <View style={styles.callView}>
              <View style={styles.secondCallView}>
                <Ionicons
                  name="ios-call-sharp"
                  size={34}
                  color="green"
                  style={{ width: "20%" }}
                  onPress={() =>
                    call({ number: `0${customermobilenumber}`, prompt: false })
                  }
                />

                <Text style={{ width: "50%" }}>0{customermobilenumber}</Text>
              </View>
            </View>
            <View style={styles.dishesView}>
              <Text style={{ color: "grey" }}> Food details:</Text>
              {Odishes.map((item, i) => (
                <View key={i}>
                  <Text>{item.attributes.dishName}</Text>
                </View>
              ))}
            </View>
            <View style={styles.PressableView}>
              {loadingPickUp ? (
                <Pressable style={[styles.button, styles.buttonClose]}>
                  <ActivityIndicator color="white" size="large" />
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => PickUp()}
                >
                  <Text style={styles.textStyle}>
                    Go To {restaurantDataName} Restaurant
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </SafeAreaView>
      );
    }

    if (status === "PickUp") {
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.body}>
            <View style={styles.statusView}>
              <Text style={styles.statusText}>
                You Have Picked The Delivery
              </Text>
            </View>
            <View style={styles.userNameView}>
              <View style={styles.secondUsernameView}>
                <Feather
                  name="user"
                  size={26}
                  color="black"
                  style={{ width: "10%" }}
                />
                <Text style={{ width: "50%" }}>{customerName}</Text>
              </View>
            </View>
            <View style={styles.addressView}>
              <View style={styles.secondAdrressView}>
                <Entypo
                  name="address"
                  size={26}
                  color="black"
                  style={{ width: "10%" }}
                />
                <Text style={{ width: "50%" }}>{address}</Text>
              </View>
            </View>

            <View style={styles.buildingView}>
              <View style={styles.secondBuildingView}>
                <FontAwesome
                  name="building"
                  size={26}
                  color="black"
                  style={{ width: "10%" }}
                />
                <Text style={{ width: "50%" }}>{building}</Text>
              </View>
            </View>

            <View style={styles.flatView}>
              <Text>{Flat}</Text>
            </View>

            <View style={styles.callView}>
              <View style={styles.secondCallView}>
                <Ionicons
                  name="ios-call-sharp"
                  size={34}
                  color="green"
                  style={{ width: "20%" }}
                  onPress={() =>
                    call({ number: `0${customermobilenumber}`, prompt: false })
                  }
                />

                <Text style={{ width: "50%" }}>0{customermobilenumber}</Text>
              </View>
            </View>
            <View style={styles.dishesView}>
              <Text style={{ color: "grey" }}> Food details:</Text>
              {Odishes.map((item, i) => (
                <View key={i}>
                  <Text>{item.attributes.dishName}</Text>
                </View>
              ))}
            </View>
            <View
              style={{
                flex: 0.1,
                justifyContent: "center",
              }}
            >
              <Pressable
                style={[styles.button2, styles.buttonClose2]}
                onPress={() => navigateToRestaurant()}
              >
                <Text style={styles.textStyle2}>
                  Go To {restaurantDataName} Restaurant
                </Text>
              </Pressable>
            </View>
            <View
              style={{
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20 }}>OR</Text>
            </View>
            <View style={styles.PressableView}>
              {loadingDelivery ? (
                <Pressable style={[styles.button, styles.buttonClose]}>
                  <ActivityIndicator color="white" size="large" />
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => AlertButton()}
                >
                  <Text style={styles.textStyle}>Start Delivery</Text>
                </Pressable>
              )}
            </View>
          </View>
        </SafeAreaView>
      );
    }
    if (status === "Delivering") {
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.body}>
            <View style={styles.statusView}>
              <Text style={styles.statusText}>
                You Are Delivering To {customerName}
              </Text>
            </View>
            <View style={styles.userNameView}>
              <View style={styles.secondUsernameView}>
                <Feather
                  name="user"
                  size={26}
                  color="black"
                  style={{ width: "10%" }}
                />
                <Text style={{ width: "50%" }}>{customerName}</Text>
              </View>
            </View>
            <View style={styles.addressView}>
              <View style={styles.secondAdrressView}>
                <Entypo
                  name="address"
                  size={26}
                  color="black"
                  style={{ width: "10%" }}
                />
                <Text style={{ width: "50%" }}>{address}</Text>
              </View>
            </View>

            <View style={styles.buildingView}>
              <View style={styles.secondBuildingView}>
                <FontAwesome
                  name="building"
                  size={26}
                  color="black"
                  style={{ width: "10%" }}
                />
                <Text style={{ width: "50%" }}>{building}</Text>
              </View>
            </View>

            <View style={styles.flatView}>
              <Text>{Flat}</Text>
            </View>

            <View style={styles.callView}>
              <View style={styles.secondCallView}>
                <Ionicons
                  name="ios-call-sharp"
                  size={34}
                  color="green"
                  style={{ width: "20%" }}
                  onPress={() =>
                    call({ number: `0${customermobilenumber}`, prompt: false })
                  }
                />

                <Text style={{ width: "50%" }}>0{customermobilenumber}</Text>
              </View>
            </View>
            <View style={styles.dishesView}>
              <Text style={{ color: "grey" }}> Food details:</Text>
              {Odishes.map((item, i) => (
                <View key={i}>
                  <Text>{item.attributes.dishName}</Text>
                </View>
              ))}
            </View>
            <View
              style={{
                flex: 0.1,
                justifyContent: "center",
              }}
            >
              <Pressable
                style={[styles.button2, styles.buttonClose2]}
                onPress={() => navigateToCustomer()}
              >
                <Text style={styles.textStyle2}>Continue Delivering</Text>
              </Pressable>
            </View>
            <View
              style={{
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20 }}>OR</Text>
            </View>
            <View style={styles.PressableView}>
              {loadingArrived ? (
                <Pressable style={[styles.button, styles.buttonClose3]}>
                  <ActivityIndicator color="white" size="large" />
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.button, styles.buttonClose3]}
                  onPress={() => AlertArrived()}
                >
                  <Text style={styles.textStyle}>Arrived</Text>
                </Pressable>
              )}
            </View>
          </View>
        </SafeAreaView>
      );
    }
    if (status === "Arrived") {
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.body}>
            <View style={styles.statusView}>
              <Text style={styles.statusText}>
                You Have Arrived You Can Call {customerName}
              </Text>
            </View>
            <View style={styles.userNameView}>
              <View style={styles.secondUsernameView}>
                <Feather
                  name="user"
                  size={26}
                  color="black"
                  style={{ width: "10%" }}
                />
                <Text style={{ width: "50%" }}>{customerName}</Text>
              </View>
            </View>
            <View style={styles.addressView}>
              <View style={styles.secondAdrressView}>
                <Entypo
                  name="address"
                  size={26}
                  color="black"
                  style={{ width: "10%" }}
                />
                <Text style={{ width: "50%" }}>{address}</Text>
              </View>
            </View>

            <View style={styles.buildingView}>
              <View style={styles.secondBuildingView}>
                <FontAwesome
                  name="building"
                  size={26}
                  color="black"
                  style={{ width: "10%" }}
                />
                <Text style={{ width: "50%" }}>{building}</Text>
              </View>
            </View>

            <View style={styles.flatView}>
              <Text>{Flat}</Text>
            </View>

            <View style={styles.callView}>
              <View style={styles.secondCallView}>
                <Ionicons
                  name="ios-call-sharp"
                  size={34}
                  color="green"
                  style={{ width: "20%" }}
                  onPress={() =>
                    call({ number: `0${customermobilenumber}`, prompt: false })
                  }
                />

                <Text style={{ width: "50%" }}>0{customermobilenumber}</Text>
              </View>
            </View>
            <View style={styles.dishesView}>
              <Text style={{ color: "grey" }}> Food details:</Text>
              {Odishes.map((item, i) => (
                <View key={i}>
                  <Text>{item.attributes.dishName}</Text>
                </View>
              ))}
            </View>
            <View style={styles.PressableView}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => AlertDelivered()}
              >
                <Text style={styles.textStyle}>Finish Delivery</Text>
              </Pressable>
            </View>
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={{ flex: 1, marginRight: 10, marginLeft: 10 }}>
                  <View style={styles.avaContainer}>
                    <ImageBackground
                      source={{
                        uri: imageUri,
                      }}
                      style={styles.avatar}
                    ></ImageBackground>
                  </View>
                  <View style={{ flex: 0.5, justifyContent: "center" }}>
                    {takePhotoLoading ? (
                      <Pressable style={[styles.button, styles.buttonClose]}>
                        <ActivityIndicator color="white" size="large" />
                      </Pressable>
                    ) : (
                      <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => captureImage()}
                      >
                        <Text style={styles.textStyle}>Take Photo</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      );
    }
    if (status === "Delivered") {
      return (
        <SafeAreaView style={styles.safe}>
          <View style={styles.body}>
            <View style={{ flex: 0.5, justifyContent: "center" }}>
              <Text style={{ textAlign: "center" }}> Well Done.</Text>
              <Text style={{ textAlign: "center" }}>
                You Have Successfully Completed The Delivery.{" "}
              </Text>
              <View
                style={{
                  backgroundColor: "green",
                  alignSelf: "center",
                  height: "40%",
                  width: "40%",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 240,
                  marginTop: 10,
                }}
              >
                <MaterialIcons name="done" size={140} color="white" />
              </View>
            </View>
            <View
              style={{
                flex: 0.5,
                backgroundColor: "white",
              }}
            >
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.textStyle}>Find More Orders</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      );
    } else {
      return (
        <View
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <Text>No Available Jobs.</Text>
        </View>
      );
    }
  }
};

export default NavigatetoApp;

const styles = StyleSheet.create({
  safe: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: "white",
  },
  body: {
    flex: 1,
    backgroundColor: "white",
    marginLeft: 10,
    marginRight: 10,
  },
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
  buttonClose3: {
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
  },
  button2: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    height: 60,
  },
  buttonClose2: {
    backgroundColor: "grey",
    justifyContent: "center",
    alignItems: "center",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 28,
  },
  textStyle2: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 22,
  },
  statusText: {
    //  backgroundColor: "green",
    // padding: 10,
    alignSelf: "flex-end",
    marginRight: 10,
    color: "green",
    fontSize: 18,
    borderRadius: 10,
  },
  statusView: {
    flex: 0.1,
    backgroundColor: "white",
    justifyContent: "center",
  },
  addressView: {
    flex: 0.1,
    backgroundColor: "white",
    justifyContent: "center",
  },
  secondAdrressView: {
    flexDirection: "row",
    alignItems: "center",
  },
  buildingView: {
    flex: 0.1,
    backgroundColor: "white",
    justifyContent: "center",
  },
  secondBuildingView: {
    flexDirection: "row",
    alignItems: "center",
  },
  flatView: {
    flex: 0.1,
    justifyContent: "center",
  },
  userNameView: {
    flex: 0.1,
    backgroundColor: "white",
    justifyContent: "center",
  },
  secondUsernameView: {
    flexDirection: "row",
    alignItems: "center",
  },
  callView: {
    flex: 0.1,
    backgroundColor: "white",
    justifyContent: "center",
  },
  secondCallView: {
    flexDirection: "row",
    alignItems: "center",
  },
  PressableView: { flex: 0.2, backgroundColor: "white" },
  dishesView: { flex: 0.25, paddingTop: 10 },
  safeContainer: { backgroundColor: colors.light_gray, flex: 1 },
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
  activity: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 22,
  },
  modalView: {
    // margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    // padding: 35,
    height: "100%",
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonM: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyleM: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  avaContainer: {
    flex: 0.5,
    alignItems: "center",
    // paddingTop: 10,
    justifyContent: "center",
    //paddingBottom: 10,
    // backgroundColor: "red",
  },
  avatar: {
    overflow: "hidden",
    // borderRadius: 180,
    width: 230,
    height: 230,
    backgroundColor: "grey",
  },
});
