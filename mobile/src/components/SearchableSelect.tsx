import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  ViewStyle,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, spacing, radii } from "../theme";

export type SelectOption = {
  id: string;
  label: string;
  hint?: string;
};

type Props = {
  value?: string;
  valueLabel?: string;
  onChange: (id: string, option: SelectOption) => void;
  options: SelectOption[];
  label?: string;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  loading?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
};

export function SearchableSelect({
  value,
  valueLabel,
  onChange,
  options,
  label,
  required,
  placeholder = "Seleccionar",
  searchPlaceholder = "Buscar...",
  emptyLabel = "Sin resultados",
  loading,
  error,
  containerStyle,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const insets = useSafeAreaInsets();

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const resolvedLabel = valueLabel ?? options.find((o) => o.id === value)?.label;

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.id, opt);
    setOpen(false);
    setQuery("");
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
        onPress={() => setOpen(true)}
        style={[styles.trigger, !!error && styles.triggerError]}
      >
        <Text
          style={[
            styles.triggerText,
            !resolvedLabel && styles.triggerPlaceholder,
          ]}
          numberOfLines={1}
        >
          {resolvedLabel ?? placeholder}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={22}
          color={colors.textMuted}
        />
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setOpen(false);
          setQuery("");
        }}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setOpen(false);
              setQuery("");
            }}
          />
          <KeyboardAvoidingView
            behavior="padding"
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, spacing.md) },
            ]}
          >
            <View style={styles.grabber} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label ?? placeholder}</Text>
              <Pressable
                onPress={() => {
                  setOpen(false);
                  setQuery("");
                }}
                hitSlop={8}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color={colors.onSurface}
                />
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={colors.textMuted}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                autoFocus
              />
            </View>

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <View style={styles.emptyWrap}>
                    <Text style={styles.emptyText}>{emptyLabel}</Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const selected = item.id === value;
                  return (
                    <Pressable
                      onPress={() => handleSelect(item)}
                      style={({ pressed }) => [
                        styles.row,
                        selected && styles.rowSelected,
                        pressed && styles.rowPressed,
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.rowLabel,
                            selected && styles.rowLabelSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {item.hint && (
                          <Text style={styles.rowHint}>{item.hint}</Text>
                        )}
                      </View>
                      {selected && (
                        <MaterialCommunityIcons
                          name="check"
                          size={20}
                          color={colors.primary}
                        />
                      )}
                    </Pressable>
                  );
                }}
              />
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    gap: spacing.sm,
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
    maxHeight: "85%",
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
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  modalTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.onSurface,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    height: 44,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurface,
    paddingVertical: 0,
  },
  listContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  rowSelected: {
    backgroundColor: colors.primaryContainer,
  },
  rowPressed: {
    backgroundColor: colors.surfaceContainerLow,
  },
  rowLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.onSurface,
  },
  rowLabelSelected: {
    color: colors.onPrimaryContainer,
    fontFamily: fonts.bodySemiBold,
  },
  rowHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  loadingWrap: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyWrap: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
});
