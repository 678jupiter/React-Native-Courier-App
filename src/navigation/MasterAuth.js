import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { useSelector } from "react-redux";
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
const Drawer = createDrawerNavigator();

function DrawerNav() {
  return (
    <Drawer.Navigator initialRouteName="Home">
      <Drawer.Screen name="Home" component={OrdersScreen} />
      <Drawer.Screen name="Account" component={Profile} />
    </Drawer.Navigator>
  );
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
