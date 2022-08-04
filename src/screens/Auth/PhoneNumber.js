import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import PhoneInput from "react-native-phone-number-input";
import { Space } from "../../../components";

const PhoneNumber = ({ navigation }) => {
  const [value, setValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const phoneInput = useRef(null);
  const sendSmsVerification = async (phoneNumber) => {
    setLoading(true);
    try {
      setLoading(true);
      const data = JSON.stringify({
        to: formattedValue,
        channel: "sms",
      });

      await fetch(`https://verify-8667-2eddxt.twil.io/start-verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      })
        .then((res) => {
          setLoading(false);
          if (res.ok === true) {
            navigation.navigate("otp", { phoneNumber: formattedValue });
          } else {
            setLoading(false);
            alert("Please try again.");
          }
        })
        .catch((error) => {
          setLoading(false);
          alert("Please try again.");
        });
    } catch (error) {
      setLoading(false);
      alert("Please try again.");
      return false;
    }
  };
  const validateNumber = () => {
    if (value.length < 10 || value.length > 10) {
      setShowMessage(true);
    } else {
      sendSmsVerification();
    }
  };

  return (
    <>
      <View style={styles.container}>
        <SafeAreaView style={styles.wrapper}>
          <View
            style={{
              flex: 0.1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            <Text style={{ fontStyle: "italic", fontWeight: "bold" }}>
              Verify your phone number.
            </Text>
          </View>

          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flex: 0.9,
            }}
          >
            {showMessage && (
              <Text style={{ color: "red" }}>
                Phone number is incorrect. Must include 10 digits eg 07XXXXXXXX
                OR 01XXXXXXXX
              </Text>
            )}
            <Space height={10} />
            <PhoneInput
              ref={phoneInput}
              defaultValue={value}
              defaultCode="KE"
              layout="first"
              onChangeText={(text) => {
                setValue(text) || setShowMessage(false);
              }}
              onChangeFormattedText={(text) => {
                setFormattedValue(text);
              }}
              countryPickerProps={{ withAlphaFilter: true }}
              withShadow
              autoFocus
            />
            {loading ? (
              <TouchableOpacity style={styles.button}>
                <ActivityIndicator size="small" color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                // onPress={() => {
                //   const checkValid = phoneInput.current?.isValidNumber(value);
                //   setShowMessage(true);
                //   setValid(checkValid ? checkValid : false);
                // }}
                onPress={() => validateNumber()}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lighter,
  },

  wrapper: {
    flex: 1,
  },

  button: {
    marginTop: 20,
    height: 50,
    width: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7CDB8A",
    shadowColor: "rgba(0,0,0,0.4)",
    shadowOffset: {
      width: 1,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 14,
  },

  welcome: {
    padding: 20,
  },

  status: {
    padding: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "flex-start",
    color: "gray",
  },
});

export default PhoneNumber;
