import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import AppLoading from "expo-app-loading";
import { NavigationContainer } from "@react-navigation/native";
import Navigation from "./src/navigation";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import store, { persistor } from "./Redux/store";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/es/integration/react";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import Track from "./Rough/Track";

const client = new ApolloClient({
  uri: "https://myfoodcms189.herokuapp.com/graphql",
  cache: new InMemoryCache(),
});

export default function App() {
  const [appReady, setAppReady] = useState(false);

  const [loaded] = useFonts({
    CircularStdBold: require("./assets/fonts/CircularStdBold.ttf"),
    CircularStdBook: require("./assets/fonts/CircularStdBook.ttf"),
    CircularStdMedium: require("./assets/fonts/CircularStdMedium.ttf"),
  });
  const tega = () => {
    return true;
  };
  if (!appReady || !loaded) {
    return (
      <AppLoading
        startAsync={tega}
        onFinish={() => setAppReady(true)}
        onError={console.warn}
      />
    );
  }

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
