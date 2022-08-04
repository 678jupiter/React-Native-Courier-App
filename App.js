import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import AppLoading from "expo-app-loading";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import store, { persistor } from "./Redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/es/integration/react";
import { useState } from "react";
import { useFonts } from "expo-font";
import FakeApp from "./fakeApp";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ImageUpload from "./ImageUpload";

const client = new ApolloClient({
  uri: "https://myfoodcms189.herokuapp.com/graphql",
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          GET_JOB_STATUS: {
            merge: true,
          },
        },
      },
    },
  }),
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
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <ApolloProvider client={client}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <FakeApp />
              {/* <ImageUpload /> */}
            </GestureHandlerRootView>
            <StatusBar style="auto" />
          </ApolloProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}
