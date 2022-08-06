import axios from "axios";
import { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { TextInput, Button, Space } from "../../../components";
import { MsgBox, primaryColor, colors } from "../../../config";
import { YAQW } from "@env";

export default function ForgotPassword({ navigation }) {
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const send = () => {
    setIsSubmitting(true);
    axios
      .post(`${YAQW}`, {
        email: email, // user's email
      })
      .then((response) => {
        setIsSubmitting(false);
        setMessage(() => (
          <Text style={styles.msgBox}>
            We have just sent you an email to reset your password.
          </Text>
        ));
      })
      .catch((error) => {
        setIsSubmitting(false);
        setMessage(() => (
          <Text style={styles.msgBox}>{error.response.data.error.message}</Text>
        ));
      });
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.container}>
        <TextInput label="Email" onChangeText={(text) => setEmail(text)} />
        <Space height={25} />
        <MsgBox type={messageType}>{message}</MsgBox>
        <Space height={25} />
        <Button
          label="Send"
          radius={6}
          txtSize={14}
          bgColor={colors.blurple}
          padSizeX={20}
          borderWidth={0}
          fontFam="CircularStdBold"
          txtDecorationLine="none"
          isSubmitting={isSubmitting}
          onPress={send}
        />
        <Space height={40} />
        <Button
          label="Register"
          txtSize={13}
          radius={0}
          borderWidth={0}
          bgColor="#fff"
          textColor={primaryColor}
          fontFam="CircularStdBold"
          onPress={() => navigation.navigate("Register")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  page: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignContent: "center",
  },
  msgBox: {
    fontFamily: "CircularStdBold",
    fontSize: 12,
    //marginBottom: 10,

    textAlign: "center",
    justifyContent: "center",
    color: primaryColor,
  },
});
