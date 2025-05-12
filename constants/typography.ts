import { StyleSheet } from "react-native";
import colors from "./colors";

export default StyleSheet.create({
  h1: {
    fontFamily: "serif",
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  h2: {
    fontFamily: "serif",
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 6,
  },
  h3: {
    fontFamily: "serif",
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  h4: {
    fontFamily: "serif",
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  body: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  category: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
