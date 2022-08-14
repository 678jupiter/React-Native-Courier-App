import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import LogIn from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";
import PhoneNumber from "../screens/Auth/PhoneNumber";
import Otp from "../screens/Auth/Otp";
import { NavigationContainer } from "@react-navigation/native";
import OrdersScreen from "../screens/OrdersScreen";
import NavigatetoApp from "../screens/NavigatetoApp";
import { colors, primaryColor } from "../../config";
import ProfileImage from "../screens/Auth/ProfileImage";
import ForgotPassword from "../screens/Auth/ForgotPassword";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Profile from "../screens/Profile/Profile";
import io from "socket.io-client";
import { useEffect } from "react";
import { socks } from "@env";
import * as Notifications from "expo-notifications";
import { reRefetchActions } from "../../Redux/reRefetch";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
const Drawer = createDrawerNavigator();

function DrawerNav() {
  const socket = io(`${socks}`);
  const user = useSelector((state) => state.cur.curmeta);
  const dispatch = useDispatch();
  function showRoom() {
    console.log(`joined room id ${user.cid}`);
  }

  useEffect(() => {
    let isCancelled = false;
    const hookup = async () => {
      const input = `${user.cid}`;
      socket.emit("enter_conversation_space", input, showRoom);
    };
    hookup();
    return () => {
      isCancelled = true;
    };
  }, []);
  socket.on("welcome", () => {
    console.log("Welcome");
  });
  socket.on("bye", () => {
    console.log("Courier left ");
  });

  const addMessage = async (message) => {
    await schedulePushNotification();
    dispatch(
      reRefetchActions.addreRefetch({
        dig: 2,
      })
    );
  };
  socket.on("new_conversation_message", addMessage);

  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={OrdersScreen} />
      <Drawer.Screen name="Account" component={Profile} />
    </Drawer.Navigator>
  );
}
async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Delivery",
      body: "You have a new delivery",
      data: { data: "goes here" },
      vibrate: true,
    },
    trigger: { seconds: 0, repeats: false },
  });
}

const MsemaKweli = () => {
  const Stack = createNativeStackNavigator();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: primaryColor,
            borderBottomColor: "black",
            shadowColor: primaryColor,
          },
          headerBackTitleVisible: false,
          headerTintColor: colors.white,
          tabBarHideOnKeyboard: true,
          headerStyle: {
            backgroundColor: colors.blurple,
          },
          headerTitleStyle: {
            color: colors.white,
          },
          headerBackImage: () => (
            <View style={{ marginLeft: 6 }}>
              <Ionicons name="md-arrow-back" color={"white"} size={26} />
            </View>
          ),
        }}
      >
        {isLoggedIn ? (
          <>
            <Stack.Screen
              name="draw"
              component={DrawerNav}
              options={{
                headerShown: false,
                animationTypeForReplace: "pop",
                title: "Home",
              }}
            />
            <Stack.Screen
              name="OrdersScreen"
              options={{
                headerShown: false,
              }}
              component={OrdersScreen}
            />

            <Stack.Screen
              name="OrdersDeliveryScreen2"
              component={NavigatetoApp}
              options={{
                headerShown: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LogIn} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen
              options={{ headerShown: false, title: "Phone number" }}
              name="phoneNumberV"
              component={PhoneNumber}
            />
            <Stack.Screen
              name="otp"
              component={Otp}
              options={{ title: "Verify" }}
            />
            <Stack.Screen name="profile Picture" component={ProfileImage} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPassword}
              options={{
                title: "Reset your password",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default MsemaKweli;
