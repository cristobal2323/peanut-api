import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  ViewStyle,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { colors, fonts, spacing, radii } from "../theme";
import { usePreferencesStore } from "../store/preferences";

type Mode = "date" | "datetime";

type Props = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  cancelLabel?: string;
  confirmLabel?: string;
  containerStyle?: ViewStyle;
  mode?: Mode;
};

const defaultMin = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 30);
  return d;
};

export function DatePickerField({
  value,
  onChange,
  label,
  required,
  placeholder = "Seleccionar fecha",
  error,
  maximumDate = new Date(),
  minimumDate = defaultMin(),
  cancelLabel = "Cancelar",
  confirmLabel = "Listo",
  containerStyle,
  mode = "date",
}: Props) {
  const locale = usePreferencesStore((s) => s.locale);
  const insets = useSafeAreaInsets();
  const [iosOpen, setIosOpen] = useState(false);
  const [iosDraft, setIosDraft] = useState<Date | undefined>(value);

  const formatter = new Intl.DateTimeFormat(
    locale === "en" ? "en-US" : "es-CL",
    mode === "datetime"
      ? { dateStyle: "medium", timeStyle: "short" }
      : { dateStyle: "long" }
  );

  const formatted = value ? formatter.format(value) : undefined;

  const openAndroid = () => {
    DateTimePickerAndroid.open({
      value: value ?? new Date(),
      mode: "date",
      maximumDate,
      minimumDate,
      onChange: (event: DateTimePickerEvent, date?: Date) => {
        if (event.type !== "set" || !date) return;
        if (mode === "datetime") {
          DateTimePickerAndroid.open({
            value: date,
            mode: "time",
            is24Hour: true,
            onChange: (e2, d2) => {
              if (e2.type !== "set" || !d2) return;
              const combined = new Date(date);
              combined.setHours(d2.getHours(), d2.getMinutes(), 0, 0);
              onChange(combined);
            },
          });
        } else {
          onChange(date);
        }
      },
    });
  };

  const openIOS = () => {
    setIosDraft(value ?? new Date());
    setIosOpen(true);
  };

  const handleTrigger = () => {
    if (Platform.OS === "ios") openIOS();
    else openAndroid();
  };

  const cancelIOS = () => {
    setIosOpen(false);
  };

  const confirmIOS = () => {
    onChange(iosDraft);
    setIosOpen(false);
  };

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <Pressable
        onPress={handleTrigger}
        style={[styles.trigger, !!error && styles.triggerError]}
      >
        <MaterialCommunityIcons
          name="calendar"
          size={20}
          color={colors.textMuted}
        />
        <Text
          style={[
            styles.triggerText,
            !formatted && styles.triggerPlaceholder,
          ]}
          numberOfLines={1}
        >
          {formatted ?? placeholder}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={22}
          color={colors.textMuted}
        />
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {Platform.OS === "ios" && (
        <Modal
          visible={iosOpen}
          transparent
          animationType="slide"
          onRequestClose={cancelIOS}
        >
          <View style={styles.backdrop}>
            <Pressable style={StyleSheet.absoluteFill} onPress={cancelIOS} />
            <View
              style={[
                styles.sheet,
                { paddingBottom: Math.max(insets.bottom, spacing.md) },
              ]}
            >
              <View style={styles.grabber} />
              <View style={styles.sheetHeader}>
                <Pressable onPress={cancelIOS} hitSlop={8}>
                  <Text style={styles.sheetAction}>{cancelLabel}</Text>
                </Pressable>
                <Text style={styles.sheetTitle}>{label ?? placeholder}</Text>
                <Pressable onPress={confirmIOS} hitSlop={8}>
                  <Text
                    style={[styles.sheetAction, styles.sheetActionPrimary]}
                  >
                    {confirmLabel}
                  </Text>
                </Pressable>
              </View>

              <DateTimePicker
                value={iosDraft ?? new Date()}
                mode={mode}
                display="spinner"
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                locale={locale === "en" ? "en-US" : "es-CL"}
                onChange={(_e, date) => date && setIosDraft(date)}
                themeVariant="light"
                textColor={colors.onSurface}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs + 2,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurface,
  },
  required: {
    color: colors.error,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    height: 50,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  triggerError: {
    borderColor: colors.error,
  },
  triggerText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurface,
  },
  triggerPlaceholder: {
    color: colors.textMuted,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.error,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: spacing.sm,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sheetTitle: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.onSurface,
  },
  sheetAction: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textMuted,
  },
  sheetActionPrimary: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
  },
});
