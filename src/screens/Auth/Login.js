import { View, Text } from "react-native";
import React from "react";
import { useDispatch } from "react-redux";
import { authActions } from "../../../Redux/AuthSlice";

const Login = () => {
  const dispatch = useDispatch();
  const onSubmit = () => {
    dispatch(authActions.login());
  };

  return (
    <View
      style={{
        justifyContent: "center",
        alignContent: "center",
        flex: 1,
        alignItems: "center",
      }}
    >
      <Text onPress={onSubmit}>Login</Text>
    </View>
  );
};

export default Login;
