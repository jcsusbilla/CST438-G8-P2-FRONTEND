import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" options={{ headerShown: false }} />
      <Stack.Screen name="Landing" options={{ headerShown: false }} />
      <Stack.Screen name="Account" options={{ headerShown: false }} />
      <Stack.Screen name="TierList" options={{ headerShown: false }} />
      <Stack.Screen name="Admin" options={{ headerShown: false, title: "Admin Dashboard" }} />
    </Stack>
  );
}