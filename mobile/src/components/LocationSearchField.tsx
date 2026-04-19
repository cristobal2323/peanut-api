import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, spacing, radii } from "../theme";
import { searchAddresses, GeocodingResult } from "../api/geocoding";

export type SelectedLocation = {
  name: string;
  latitude: number;
  longitude: number;
};

type Props = {
  value: SelectedLocation | null;
  onChange: (loc: SelectedLocation | null) => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  containerStyle?: ViewStyle;
};

export function LocationSearchField({
  value,
  onChange,
  label,
  placeholder = "Buscar dirección",
  searchPlaceholder = "Ej: Santiago, Madrid...",
  emptyLabel = "Sin resultados",
  containerStyle,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const ctl = new AbortController();
      abortRef.current = ctl;
      try {
        const r = await searchAddresses(q, ctl.signal);
        if (!ctl.signal.aborted) setResults(r);
      } catch {
      } finally {
        if (!ctl.signal.aborted) setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setLoading(false);
  };

  const pick = (r: GeocodingResult) => {
    const name = r.secondary
      ? `${r.primary}, ${r.secondary}`
      : r.primary;
    onChange({ name, latitude: r.latitude, longitude: r.longitude });
    close();
  };

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable onPress={() => setOpen(true)} style={styles.trigger}>
        <MaterialCommunityIcons
          name="map-search-outline"
          size={20}
          color={value ? colors.primary : colors.textMuted}
        />
        <Text
          style={[styles.triggerText, !value && styles.triggerPlaceholder]}
          numberOfLines={1}
        >
          {value ? value.name.split(",").slice(0, 2).join(",") : placeholder}
        </Text>
        {value && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        )}
        {!value && (
          <MaterialCommunityIcons
            name="chevron-down"
            size={22}
            color={colors.textMuted}
          />
        )}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          <KeyboardAvoidingView
            behavior="padding"
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, spacing.md) },
            ]}
          >
            <View style={styles.grabber} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {label ?? "Buscar dirección"}
              </Text>
              <Pressable onPress={close} hitSlop={8}>
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
                autoCorrect={false}
              />
              {loading && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
            </View>

            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                !loading ? (
                  <View style={styles.emptyWrap}>
                    <Text style={styles.emptyText}>
                      {query.trim().length < 2
                        ? "Escribe al menos 2 caracteres"
                        : emptyLabel}
                    </Text>
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => pick(item)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <View style={styles.rowText}>
                    <Text style={styles.rowPrimary} numberOfLines={1}>
                      {item.primary}
                    </Text>
                    {item.secondary ? (
                      <Text style={styles.rowSecondary} numberOfLines={1}>
                        {item.secondary}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              )}
            />
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
  triggerText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurface,
  },
  triggerPlaceholder: { color: colors.textMuted },
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
  rowPressed: {
    backgroundColor: colors.surfaceContainerLow,
  },
  rowText: { flex: 1 },
  rowPrimary: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.onSurface,
  },
  rowSecondary: {
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
});
