import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  ViewStyle,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, spacing, radii } from "../theme";
import type { SelectOption } from "./SearchableSelect";

type Props = {
  values: string[];
  onChange: (ids: string[]) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  error?: string;
  containerStyle?: ViewStyle;
  doneLabel?: string;
  clearLabel?: string;
  renderOptionLeading?: (option: SelectOption) => React.ReactNode;
};

export function MultiSelectField({
  values,
  onChange,
  options,
  label,
  placeholder = "Seleccionar",
  searchPlaceholder = "Buscar...",
  emptyLabel = "Sin resultados",
  error,
  containerStyle,
  doneLabel = "Listo",
  clearLabel = "Limpiar",
  renderOptionLeading,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<string[]>(values);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (open) setDraft(values);
  }, [open, values]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const triggerLabel = useMemo(() => {
    if (!values.length) return placeholder;
    const selected = options.filter((o) => values.includes(o.id));
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) return selected[0].label;
    return `${selected[0].label} +${selected.length - 1}`;
  }, [values, options, placeholder]);

  const toggle = (id: string) => {
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const apply = () => {
    onChange(draft);
    setOpen(false);
    setQuery("");
  };

  const cancel = () => {
    setOpen(false);
    setQuery("");
  };

  const clearAll = () => setDraft([]);

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.trigger, !!error && styles.triggerError]}
      >
        <Text
          style={[
            styles.triggerText,
            !values.length && styles.triggerPlaceholder,
          ]}
          numberOfLines={1}
        >
          {triggerLabel}
        </Text>
        {values.length > 0 && (
          <View style={styles.count}>
            <Text style={styles.countText}>{values.length}</Text>
          </View>
        )}
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
        onRequestClose={cancel}
      >
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={cancel} />
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
              <Pressable onPress={cancel} hitSlop={8}>
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
                const selected = draft.includes(item.id);
                return (
                  <Pressable
                    onPress={() => toggle(item.id)}
                    style={({ pressed }) => [
                      styles.row,
                      selected && styles.rowSelected,
                      pressed && styles.rowPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selected && styles.checkboxChecked,
                      ]}
                    >
                      {selected && (
                        <MaterialCommunityIcons
                          name="check"
                          size={14}
                          color="#ffffff"
                        />
                      )}
                    </View>
                    {renderOptionLeading?.(item)}
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
                  </Pressable>
                );
              }}
            />

            <View style={styles.footer}>
              {draft.length > 0 && (
                <Pressable onPress={clearAll} style={styles.clearBtn}>
                  <Text style={styles.clearText}>{clearLabel}</Text>
                </Pressable>
              )}
              <Pressable onPress={apply} style={styles.doneBtn}>
                <Text style={styles.doneText}>
                  {doneLabel}
                  {draft.length > 0 ? ` (${draft.length})` : ""}
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs + 2 },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurface,
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
  triggerError: { borderColor: colors.error },
  triggerText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurface,
  },
  triggerPlaceholder: { color: colors.textMuted },
  count: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: "#fff",
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
    backgroundColor: "#fff",
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
    gap: spacing.sm + 2,
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.outline,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  emptyWrap: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onSurface,
  },
  doneBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: "#fff",
  },
});
