import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput as TextInputReact,
} from "react-native";

const TextInput = ({ label, placeholder, KeyboardType, ...props }) => {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInputReact
        style={styles.input}
        autoCapitalize="none"
        placeholder={placeholder}
        keyboardType={KeyboardType}
        {...props}
      />
    </View>
  );
};

export default TextInput;

const styles = StyleSheet.compose({
  label: {
    fontFamily: "CircularStdBold",
    fontSize: 14,
    marginBottom: 10,
  },
  input: {
    fontFamily: "CircularStdBook",
    fontSize: 14,
    color: "#000",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 6,
    borderStyle: "solid",
    borderColor: "#32cd32",
  },
});
