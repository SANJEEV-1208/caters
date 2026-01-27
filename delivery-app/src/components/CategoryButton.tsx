import { Pressable, Text, StyleSheet } from "react-native";

type Props = {
  title: string;
  active?: boolean;
  onPress : () => void
};

export default function CategoryButton({ title, active, onPress}: Props) {
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#EDEDED",
  },
  activeButton: {
    backgroundColor: "#FC8019",
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
  activeText: {
    color: "#fff",
    fontWeight: "600",
  },
});
