import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Joinroom from "../screens/joinroom";
import Room from "../screens/room";
const Stack = createNativeStackNavigator();

export default function SocketNav() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          borderBottomColor: "black",
        },
        headerTintColor: "#FFFFFF",
        headerBackTitleVisible: false,
      }}
      initialRouteName="joinroom"
    >
      <Stack.Screen
        name="joinroom"
        component={Joinroom}
        options={
          {
            // headerShown: false,
          }
        }
      />
      <Stack.Screen name="room" component={Room} />
    </Stack.Navigator>
  );
}
