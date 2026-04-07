/**
 * Lucide → MaterialCommunityIcons reference table.
 *
 * Peanutappdesign uses Lucide icons. The mobile app uses
 * `@expo/vector-icons/MaterialCommunityIcons`. This file is a static
 * lookup so implementers can quickly find the MCI equivalent for
 * any Lucide icon name referenced in the design.
 *
 * Usage: just look up the value here and pass it directly to
 * <MaterialCommunityIcons name="..." />. No runtime wrapper.
 */
export const iconMap = {
  // Navigation
  ArrowLeft: "chevron-left",
  ArrowRight: "chevron-right",
  ChevronRight: "chevron-right",
  ChevronLeft: "chevron-left",
  ChevronDown: "chevron-down",
  ChevronUp: "chevron-up",
  X: "close",

  // Actions
  Plus: "plus",
  Edit: "pencil",
  Edit2: "pencil-outline",
  Trash2: "trash-can-outline",
  Upload: "upload",
  Share2: "share-variant",
  Copy: "content-copy",
  RotateCcw: "rotate-left",
  Check: "check",
  CheckCircle: "check-circle",
  CheckCircle2: "check-circle-outline",
  XCircle: "close-circle",
  AlertCircle: "alert-circle",
  AlertTriangle: "alert",
  Info: "information-outline",

  // Camera & Scan
  Camera: "camera",
  CameraOff: "camera-off",
  ScanLine: "line-scan",
  Scan: "scan-helper",
  Image: "image-outline",
  ImagePlus: "image-plus",

  // Map & Location
  MapPin: "map-marker",
  Map: "map",
  Navigation: "navigation",
  Compass: "compass",
  Globe: "earth",

  // Communication
  Phone: "phone",
  PhoneCall: "phone-outgoing",
  Mail: "email-outline",
  MessageCircle: "message-outline",
  Send: "send",
  Bell: "bell-outline",
  BellOff: "bell-off-outline",

  // User
  User: "account-outline",
  Users: "account-group-outline",
  UserPlus: "account-plus-outline",
  Heart: "heart-outline",

  // Settings & System
  Settings: "cog-outline",
  Sliders: "tune",
  HelpCircle: "help-circle-outline",
  LogOut: "logout",
  LogIn: "login",
  Lock: "lock-outline",
  Unlock: "lock-open-outline",
  Eye: "eye-outline",
  EyeOff: "eye-off-outline",
  Shield: "shield-outline",
  ShieldCheck: "shield-check-outline",

  // Time & Calendar
  Calendar: "calendar-outline",
  Clock: "clock-outline",

  // Misc
  Search: "magnify",
  Filter: "filter-variant",
  Star: "star-outline",
  Award: "trophy-outline",
  Zap: "lightning-bolt",
  Sparkles: "creation",
  Gift: "gift-outline",

  // Dog-specific
  Dog: "dog",
  PawPrint: "paw",
  Bone: "bone",
} as const;

export type LucideIconName = keyof typeof iconMap;
export type MciIconName = (typeof iconMap)[LucideIconName];
