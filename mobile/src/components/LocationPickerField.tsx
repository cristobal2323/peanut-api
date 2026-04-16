import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Alert,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii, spacing } from "../theme";
import { useTranslation } from "../i18n";

export type LocationValue = {
  latitude: number;
  longitude: number;
  address?: string;
};

type Props = {
  value?: LocationValue;
  onChange: (v: LocationValue | undefined) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  containerStyle?: ViewStyle;
  cancelLabel?: string;
  confirmLabel?: string;
};

const DEFAULT_REGION: Region = {
  latitude: -33.4378,
  longitude: -70.6505,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | undefined> {
  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (places.length === 0) return undefined;
    const p = places[0];
    const parts = [p.street, p.name, p.city, p.region].filter(Boolean);
    const unique = Array.from(new Set(parts));
    return unique.join(", ") || undefined;
  } catch {
    return undefined;
  }
}

export function LocationPickerField({
  value,
  onChange,
  label,
  required,
  placeholder = "Seleccionar ubicación",
  error,
  containerStyle,
  cancelLabel = "Cancelar",
  confirmLabel = "Listo",
}: Props) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draftCoords, setDraftCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [draftAddress, setDraftAddress] = useState<string | undefined>(undefined);
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);

  const formatted =
    value?.address ??
    (value ? `${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}` : undefined);

  const openPicker = async () => {
    if (value) {
      setDraftCoords({ latitude: value.latitude, longitude: value.longitude });
      setDraftAddress(value.address);
    } else {
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status === "granted") {
          const loc = await Location.getLastKnownPositionAsync({});
          if (loc) {
            setDraftCoords({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
            setDraftAddress(undefined);
          }
        }
      } catch {}
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    if (!draftCoords) return;
    mapRef.current?.animateToRegion(
      {
        latitude: draftCoords.latitude,
        longitude: draftCoords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300
    );
  }, [open, draftCoords?.latitude, draftCoords?.longitude]);

  const pickOnMap = async (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setDraftCoords({ latitude, longitude });
    setDraftAddress(undefined);
    setResolving(true);
    const addr = await reverseGeocode(latitude, longitude);
    setDraftAddress(addr);
    setResolving(false);
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("Sin permiso", "Activa la ubicación para usar tu posición actual.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setDraftCoords({ latitude, longitude });
      setDraftAddress(undefined);
      setResolving(true);
      const addr = await reverseGeocode(latitude, longitude);
      setDraftAddress(addr);
      setResolving(false);
    } finally {
      setLocating(false);
    }
  };

  const cancel = () => {
    setOpen(false);
  };

  const confirm = () => {
    if (draftCoords) {
      onChange({
        latitude: draftCoords.latitude,
        longitude: draftCoords.longitude,
        address: draftAddress,
      });
    }
    setOpen(false);
  };

  const initialRegion: Region = draftCoords
    ? {
        latitude: draftCoords.latitude,
        longitude: draftCoords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : DEFAULT_REGION;

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <Pressable
        onPress={openPicker}
        style={[styles.trigger, !!error && styles.triggerError]}
      >
        <MaterialCommunityIcons
          name="map-marker"
          size={20}
          color={formatted ? colors.primary : colors.textMuted}
        />
        <Text
          style={[styles.triggerText, !formatted && styles.triggerPlaceholder]}
          numberOfLines={1}
        >
          {formatted ?? placeholder}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={colors.textMuted}
        />
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={cancel}
        presentationStyle="fullScreen"
      >
        <View style={styles.modalScreen}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
            onPress={pickOnMap}
            showsUserLocation
          >
            {draftCoords && (
              <Marker
                coordinate={draftCoords}
                draggable
                onDragEnd={async (ev) => {
                  const { latitude, longitude } = ev.nativeEvent.coordinate;
                  setDraftCoords({ latitude, longitude });
                  setResolving(true);
                  const addr = await reverseGeocode(latitude, longitude);
                  setDraftAddress(addr);
                  setResolving(false);
                }}
              >
                <View style={styles.marker}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={36}
                    color={colors.primary}
                  />
                </View>
              </Marker>
            )}
          </MapView>

          {/* Top bar */}
          <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
            <Pressable style={styles.topBtn} onPress={cancel} hitSlop={8}>
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={colors.onSurface}
              />
            </Pressable>
            <View style={styles.topTitleWrap}>
              <Text style={styles.topTitle}>{label ?? placeholder}</Text>
              <Text style={styles.topHint}>
                Toca el mapa o arrastra el pin para ajustar
              </Text>
            </View>
            <Pressable
              style={styles.topBtn}
              onPress={useMyLocation}
              disabled={locating}
              hitSlop={8}
            >
              {locating ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <MaterialCommunityIcons
                  name="crosshairs-gps"
                  size={22}
                  color={colors.primary}
                />
              )}
            </Pressable>
          </View>

          {/* Bottom sheet */}
          <View
            style={[
              styles.bottomSheet,
              { paddingBottom: Math.max(insets.bottom, spacing.md) },
            ]}
          >
            <View style={styles.addressRow}>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={22}
                color={colors.primary}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressLabel}>Ubicación seleccionada</Text>
                <Text style={styles.addressText} numberOfLines={2}>
                  {resolving
                    ? "Buscando dirección..."
                    : draftAddress ??
                      (draftCoords
                        ? `${draftCoords.latitude.toFixed(5)}, ${draftCoords.longitude.toFixed(5)}`
                        : "Toca el mapa para elegir")}
                </Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <Pressable style={styles.btnGhost} onPress={cancel}>
                <Text style={styles.btnGhostText}>{cancelLabel}</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.btnPrimary,
                  !draftCoords && styles.btnPrimaryDisabled,
                ]}
                onPress={confirm}
                disabled={!draftCoords}
              >
                <Text style={styles.btnPrimaryText}>{confirmLabel}</Text>
              </Pressable>
            </View>
          </View>
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

  modalScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  marker: {
    alignItems: "center",
    justifyContent: "center",
  },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  topBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  topTitleWrap: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  topTitle: {
    fontFamily: fonts.headingMedium,
    fontSize: 14,
    color: colors.onSurface,
  },
  topHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  addressLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  addressText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onSurface,
    marginTop: 2,
  },

  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  btnGhost: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  btnGhostText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.onSurface,
  },
  btnPrimary: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  btnPrimaryDisabled: {
    opacity: 0.5,
  },
  btnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: "#fff",
  },
});
