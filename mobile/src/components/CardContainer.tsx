import React, { forwardRef } from "react";
import { Card } from "react-native-paper";
import { StyleSheet } from "react-native";

type Props = React.ComponentProps<typeof Card>;

export const CardContainer = forwardRef<React.ComponentRef<typeof Card>, Props>(
  ({ children, style, ...rest }, ref) => (
    <Card ref={ref} mode="elevated" style={[styles.card, style]} {...rest}>
      {children}
    </Card>
  )
);

CardContainer.displayName = "CardContainer";

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginVertical: 8,
    elevation: 1
  }
});
