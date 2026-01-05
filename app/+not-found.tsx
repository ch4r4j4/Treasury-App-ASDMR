import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Página No Encontrada" }} />
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <AlertCircle size={64} color="#FF5722" />
        </View>
        <Text style={styles.title}>Página No Encontrada</Text>
        <Text style={styles.description}>La página que buscas no existe.</Text>

        <Link href="/" style={styles.link}>
          <View style={styles.linkButton}>
            <Text style={styles.linkText}>Volver al Inicio</Text>
          </View>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 20,
    backgroundColor: "#F5F7FA",
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1A1A2E",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center" as const,
  },
  link: {
    marginTop: 8,
  },
  linkButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
});