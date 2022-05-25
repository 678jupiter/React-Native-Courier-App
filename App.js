import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import Navigation from "./src/navigation";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import store, { persistor } from "./Redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/es/integration/react";

const client = new ApolloClient({
  uri: "https://myfoodcms189.herokuapp.com/graphql",
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <ApolloProvider client={client}>
          <NavigationContainer>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Navigation />
            </GestureHandlerRootView>
            <StatusBar style="auto" />
          </NavigationContainer>
        </ApolloProvider>
      </PersistGate>
    </Provider>
  );
}
