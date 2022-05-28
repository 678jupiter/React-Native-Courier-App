import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OrdersScreen from "../screens/OrdersScreen";
import OrdersDeliveryScreen from "../screens/OrderDelivery";
import { useDispatch, useSelector } from "react-redux";
import Login from "../screens/Auth/Login";
import Register from "../screens/Auth/Register";

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  //const user = useSelector((state) => state.user.itemsList);
  //  console.log(user);

  //console.log(user);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
          <Stack.Screen
            name="OrdersDeliveryScreen"
            component={OrdersDeliveryScreen}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default Navigation;
