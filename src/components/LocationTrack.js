import { Asset } from "expo-asset";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Animated, StyleSheet, View, BackHandler } from "react-native";
import * as Location from "expo-location";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { myLocActions } from "../../Redux/myLocationSlice";
import MsemaKweli from "../navigation/MasterAuth";
import * as TaskManager from "expo-task-manager";
import { getPreciseDistance } from "geolib";
import { resActions } from "../../Redux/myRestSlice";
import { RAWEN } from "@env";

// Instruct SplashScreen not to hide yet, we want to do this manually
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export default function BackGroundApp() {
  return (
    <AnimatedAppLoader image={require("../../assets/splash.png")}>
      <MsemaKweli />
    </AnimatedAppLoader>
  );
}

function AnimatedAppLoader({ children, image }) {
  const [isSplashReady, setSplashReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await Asset.fromModule(image).downloadAsync();
      setSplashReady(true);
    }

    prepare();
  }, [image]);

  if (!isSplashReady) {
    return null;
  }

  return <AnimatedSplashScreen image={image}>{children}</AnimatedSplashScreen>;
}

function AnimatedSplashScreen({ children, image }) {
  const dispatch = useDispatch();
  const [resLat, setRestLat] = useState("");
  const [resLng, setRestLng] = useState("");
  const token = useSelector((state) => state.token.userToken);
  const courierData = useSelector((state) => state.cur.curmeta);
  //console.log(courierData);
  const authAxios = axios.create({
    baseURL: `${RAWEN}`,
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
        setRestLat(Latitude);
        setRestLng(Longitude);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    getRestaurantLocation();
  }, []);

  const animation = useMemo(() => new Animated.Value(1), []);
  const [isAppReady, setAppReady] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

  const updateCourierDistance = async (item) => {
    await authAxios
      .put(`couriers/${courierData.cid} `, {
        data: {
          distanceFromRestaurant: Number(item),
        },
      })
      .then((res) => {
        //  console.log(res.data);

        const {
          data: {
            id,
            attributes: {
              mobileNumber,
              secondName,
              firstName,
              active,
              image,
              distanceFromRestaurant,
            },
          },
        } = res.data;
        // dispatch(
        //   curActions.addcur({
        //     cid: id,
        //     image: image,
        //     phoneNumber: mobileNumber,
        //     secondName: secondName,
        //     firstName: firstName,
        //     active: active,
        //     distanceFromRestaurant: distanceFromRestaurant,
        //   })
        // );
        console.log(
          "Updated courier distance betwwen restaurant and Cur Redux"
        );
      })
      .catch((error) => {
        console.log(`distance between update failed ${error}`);
      });
  };
  useEffect(() => {
    if (isAppReady) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setAnimationComplete(true));
    }
  }, [isAppReady]);

  const onImageLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
      // Load stuff
      await Promise.all([]);
    } catch (e) {
      // handle errors
    } finally {
      setAppReady(false);
      requestPermissions();
    }
  }, []);
  const LOCATION_TASK_NAME = "background-location-task1";

  const requestPermissions = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    console.log(status);
    if (status === "granted") {
      console.log(status);

      setAppReady(true);
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 100,
        deferredUpdatesInterval: 0,
        deferredUpdatesDistance: 0,
        pausesUpdatesAutomatically: false,
      });
    }
    if (status !== "granted") {
      validateBackgroundLocation();
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
      //   console.log("Updating Redux");
      dispatch(
        myLocActions.addLocation({
          myLat: latitude,
          myLng: longitude,
        })
      );
      var pdis = getPreciseDistance(
        {
          latitude: Number(resLat),
          longitude: Number(resLng),
        },
        {
          latitude: Number(latitude),
          longitude: Number(longitude),
        }
      );
      // console.log();
      updateCourierDistance(Number(pdis / 1000));
    }
  });

  function validateBackgroundLocation() {
    Alert.alert(`Please Select allow all the time`, "", [
      {
        text: "cancel",
        onPress: () => BackHandler.exitApp(),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => Location.requestBackgroundPermissionsAsync(),
      },
    ]);
  }
  return (
    <View style={{ flex: 1 }}>
      {isAppReady && children}
      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Constants.manifest.splash.backgroundColor,
              opacity: animation,
            },
          ]}
        >
          <Animated.Image
            style={{
              width: "100%",
              height: "100%",
              resizeMode: Constants.manifest.splash.resizeMode || "contain",
              transform: [
                {
                  scale: animation,
                },
              ],
            }}
            source={image}
            onLoadEnd={onImageLoaded}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </View>
  );
}
