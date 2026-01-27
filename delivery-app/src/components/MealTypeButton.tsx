import { Pressable, Text, StyleSheet } from "react-native";

type Props = {
  title: string;
  active?: boolean;
  onPress: () => void;
};

export default function MealTypeButton({ title, active, onPress }: Props) {
  return (
    <Pressable
      style={[
        styles.button,
        active && styles.activeButton,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          active && styles.activeText
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  activeButton: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  text: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeText: {
    color: "#fff",
    fontWeight: "700",
  },
});
