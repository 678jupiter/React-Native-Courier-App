import { Asset } from "expo-asset";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Animated, StyleSheet, View, BackHandler } from "react-native";
import * as Location from "expo-location";
import LocationTrack from "./src/components/LocationTrack";

// Instruct SplashScreen not to hide yet, we want to do this manually
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export default function BackGroundApp() {
  return (
    <AnimatedAppLoader image={require("./assets/splash.png")}>
      <LocationTrack />
    </AnimatedAppLoader>
  );
}

function AnimatedAppLoader({ children, image }) {
  const [isSplashReady, setSplashReady] = useState(false);

  useEffect(() => {
    let isActive = true;
    async function prepare() {
      await Asset.fromModule(image).downloadAsync();
      setSplashReady(true);
    }
    prepare();
    return () => {
      isActive = false;
    };
  }, [image]);

  if (!isSplashReady) {
    return null;
  }

  return <AnimatedSplashScreen image={image}>{children}</AnimatedSplashScreen>;
}

function AnimatedSplashScreen({ children, image }) {
  const animation = useMemo(() => new Animated.Value(1), []);
  const [isAppReady, setAppReady] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    let isActive = true;
    if (isAppReady) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setAnimationComplete(true));
    }
    return () => {
      isActive = false;
    };
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
  function validateBackgroundLocation() {
    Alert.alert(`Please Select allow all the time`, "", [
      {
        text: "cancel",
        onPress: () => BackHandler.exitApp(),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () =>
          Location.requestBackgroundPermissionsAsync() && checkagain1(),
      },
    ]);
  }
  const checkagain1 = async () => {
    let { res } = await Location.requestBackgroundPermissionsAsync();
    if (res !== "granted") {
      setTimeout(function () {
        requestPermissions();
      }, 2500);
    }
    if (res === "granted") {
      requestPermissions();
    }
  };
  const requestPermissions = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    console.log(status);
    if (status === "granted") {
      console.log(status);
      setAppReady(true);
    }
    if (status !== "granted") {
      console.log(status);
      validateBackgroundLocation();
      // setAppReady(true);
    }
  };

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
