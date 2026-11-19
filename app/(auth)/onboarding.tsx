import { View, Text, TextInput, Button } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Onboarding() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleContinue = async () => {
    await AsyncStorage.setItem("userName", name);
    router.replace("/(app)");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text>Enter your name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
      />
      <Button title="Continue" onPress={handleContinue} />
    </View>
  );
}