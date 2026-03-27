# DESIGN.md — Peanut Design Specification

> Source: [Stitch Project](https://stitch.withgoogle.com/projects/12643697214586868215)
> Last updated: 2026-03-27

---

## 1. Product Vision

**"The Digital Guardian"** — Peanut is a premium dog identification and lost-dog reporting platform that uses nose-print biometrics (trufa) as a unique identifier. The app balances high-tech precision with the emotional warmth of pet ownership.

### Three Pillars
1. **Biometric Identity** — Each dog's nose print is unique, like a fingerprint. Peanut captures and stores it as a digital ID.
2. **Instant Community Alerts** — When a dog goes missing, nearby users and shelters are notified immediately.
3. **Automated Matching** — When someone finds a dog and scans its nose, the system matches it against the database with a confidence score.

---

## 2. Design System: "Editorial Biometrics"

### 2.1 Creative Direction

The design moves away from generic startup aesthetics toward an **editorial magazine** feel — spacious, intentional, and authoritative, yet soft enough for moments of urgency.

**Key Principles:**
- **Breathing Room** — Generous white space to isolate critical biometric data
- **Soft Geometry** — Large corner radius (3rem/`xl`) mimicking organic pet features
- **Intentional Overlap** — Floating biometric elements over lifestyle photography for depth
- **Organic Asymmetry** — Asymmetrical layouts with photos bleeding off-screen edges

### 2.2 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#a23f00` | Main CTAs, interactive elements |
| `primary_container` | `#fa7025` | Gradient endpoints, accent fills |
| `primary_fixed` | `#ffdbcd` | Subtle background highlights |
| `secondary` | `#2d6482` | Safety actions, secondary CTAs |
| `secondary_container` | `#a7dbfe` | "Verified" badges, info cards |
| `tertiary` | `#006d3f` | Success states, "safe" indicators |
| `tertiary_container` | `#3eac70` | Found/safe badges |
| `surface` | `#fff8ef` | Base canvas (Level 0) |
| `surface_container_low` | `#fbf3e4` | Section backgrounds (Level 1) |
| `surface_container_highest` | `#e9e2d3` | Interactive card backgrounds (Level 2) |
| `on_surface` | `#1e1b13` | Primary text (never use pure #000) |
| `on_surface_variant` | `#564337` | Secondary text |
| `outline_variant` | `#dcc1b1` | Ghost borders (at 20% opacity) |
| `error` | `#ba1a1a` | Error states, urgent alerts |

**The "No-Line" Rule:** No 1px solid borders. Layout boundaries are created through **background color shifts** between surface levels.

**Gradient CTAs:** Primary buttons use a linear gradient from `primary` to `primary_container` at 135 degrees.

**Glassmorphism:** Biometric overlays use `surface` at 60% opacity with 20px backdrop-blur.

### 2.3 Typography

| Scale | Font | Size | Usage |
|---|---|---|---|
| `display-lg` | Plus Jakarta Sans | 3.5rem | Hero moments ("Found!") |
| `headline-lg` | Plus Jakarta Sans | 2rem | Page titles, biometric status |
| `title-sm` | Plus Jakarta Sans | — | Button labels |
| `body-md` | Inter | 0.875rem | Data-heavy content (line-height 1.6) |
| `label-*` | Inter | — | Form labels, metadata |

### 2.4 Elevation & Depth

- **Primary method:** Tonal layering — a `surface_container_lowest` (#fff) card on `surface` (#fff8ef) creates natural lift
- **Ambient shadows:** `0px 24px 48px rgba(30, 27, 19, 0.06)` for floating elements (uses `on_surface` color, not pure black)
- **Ghost borders:** `outline_variant` at 20% opacity — a suggestion of a line, not a hard barrier

### 2.5 Corner Radius

| Token | Value | Usage |
|---|---|---|
| `md` | 1.5rem | Minimum for containers larger than buttons |
| `lg` | 2rem | List item capsules |
| `xl` | 3rem | Primary cards, biometric cards |
| `full` | 9999px | Buttons, pills, badges |

### 2.6 Spacing

Scale factor: 3 (spacious). Vertical separation between list items uses `spacing-4` (1.4rem) instead of `<hr>` dividers.

---

## 3. Navigation Structure

### Bottom Tab Bar (5 tabs)

| Tab | Icon | Label | Destination |
|---|---|---|---|
| Home | `home` | Inicio | Dashboard principal |
| Community | `group` | Comunidad | Feed de actividad |
| Scan | `qr_code_scanner` | Escanear | Captura biometrica |
| Alerts | `notifications` | Alertas | Centro de notificaciones |
| Profile | `person` | Perfil | Perfil de usuario |

---

## 4. Screen Inventory

### 4.1 Onboarding & Auth

#### Bienvenida (Welcome)
- Hero image: Golden Retriever with biometric scan overlay
- App name "Peanut" with subtitle "Digital Guardian"
- Tagline: "Tecnologia Trufa — Biometria 100% Unica"
- Value proposition: "Protege a quien mas te quiere"
- CTAs: "Comenzar" (primary) / "Ya tengo cuenta" (secondary)
- Legal footer with Terms of Service and Privacy Policy

#### Onboarding (3 steps)
- **Step 1:** "Identidad Unica" — Explains nose-print biometrics
- **Step 2-3:** Additional onboarding steps
- Progress indicator: "Paso X de 3"
- "Siguiente" button to advance

#### Login / Registro
- Header: "Hola de nuevo" / "Tu comunidad te espera"
- Form fields: Email, Password (with visibility toggle)
- "Olvidaste tu contrasena?" link
- "Iniciar Sesion" primary CTA
- Social auth: Google and Apple sign-in
- Footer: "No tienes una cuenta? Crear cuenta"
- Security badge: "Tus datos y los de tu perro estan protegidos"

### 4.2 Home (Dashboard)

#### Home Principal
- **Header:** User greeting ("Hola, Maria!"), notification bell
- **Protection Status Card:** Dog status ("Protegido" / "Peanut esta seguro"), link to biometric profile, hero dog image
- **Quick Actions (5 buttons):**
  - Trufa ID (shows match %, e.g. "98.4% Match")
  - Escanear Trufa
  - Reportar Perdido
  - Encontre un perro
  - Comunidad
- **Zone Alert:** "Posible coincidencia de Golden Retriever a 2km" with "Ver ahora"
- **Protection Progress (85%):** Checklist — registration, photos, nose biometry (done), emergency contact (pending)
- **Recent Activity:** Timeline of scans and alerts
- **My Dogs Section:** Cards for each dog with status (Protegido / Falta Trufa)
- **Educational Card:** "Como funciona la Trufa?" explainer
- **Nearby Lost Dogs:** Cards showing name, distance, last seen time

### 4.3 Dog Management

#### Registrar Perro (3-step form)
- **Step 1 — Profile Info:**
  - Photo upload
  - Name field
  - Gender: Macho / Hembra radio buttons
  - Breed dropdown: Golden Retriever, Pastor Aleman, Bulldog Frances, Mestizo/Otros
  - Age (years)
  - Microchip checkbox
  - Distinctive traits textarea
  - Info section: "Seguridad Biometrica"
  - CTA: "Continuar al escaneo de trufa"

#### Escanear Trufa (Biometric Capture)
- Full-screen camera viewfinder with glassmorphism overlay
- Status text: "Analizando textura..."
- Instruction icons:
  - `light_mode` — "Busca buena iluminacion"
  - `zoom_in` — "Acerca la camara lentamente"
  - `vibration` — "Mantente estable"
- Technical readout: SCAN_MODE: TRUFA_BIOMETRIC, ISO: 400, F: 1.8, DEPTH_MAP: ACTIVE, SENSITIVITY: 98.4%
- Footer: "Noseprint ID v2.0"

#### Confirmacion Biometrica
- Success heading: "Identidad Registrada!"
- Message: "La trufa de Coco ahora es su identificador unico digital"
- Biometric visualization image
- Stats: "Biometria 100% Verificada" / "Puntos de Referencia: 1,402"
- CTAs: "Guardar perfil" (primary) / "Volver a escanear" (secondary)
- Security badge: "ENCRIPTACION DE GRADO BIOMETRICO ACTIVA"

#### Perfil del Perro
- Dog photo with verified nose-print badge
- Name, breed, age: "Coco — Golden Retriever, 3 anos"
- Status: "Seguro"
- Action buttons: Update trufa scan, Report as lost, Edit profile
- **Registry History Timeline:**
  - Routine scan (today, 14:32) with GPS
  - Profile photo update (yesterday, 09:15)
  - Microchip verification (date)
- Biometric ID: "Trufa ID: 8829-X" with verification checkmark

### 4.4 Lost & Found Flow

#### Reportar Perdido
- Urgency badge: "Nivel de Urgencia: Alta"
- Notification message: immediate alert to nearby Peanut network
- Dog card with photo and bio-verified badge
- **Location & Time:**
  - Map snippet
  - Address field (e.g. "Calle de la Princesa, 24, Madrid")
  - Date and time selectors
- Urgent comment section
- "Activar alerta comunitaria" — notifies shelters and users within 5km
- CTA: "REPORTAR COMO PERDIDO"
- Share options

#### Encontre un Perro (Found a Dog)
- Form for reporting a found dog
- Photo upload
- Location capture
- Option to scan nose for biometric matching

#### Mapa de Avistamientos
- Interactive map showing sighting pins
- Search area radius visualization
- Lost/found dog markers with status

#### Detalle de Reporte
- Hero dog photo with "Extraviado" status badge
- Title: "Buscando a Bruno"
- Last seen: "Visto por ultima vez hace 2 horas"
- QR scanner for biometric verification
- **Case Details:** Case number, description of circumstances
- **Search Zone:** 500m radius, address, embedded maps
- **Action Buttons:**
  - "Lo vi" (sighting only)
  - "Lo tengo" (I have the dog)
  - "Esta a salvo conmigo" (safe with me)

#### Posible Coincidencia (Biometric Match)
- Header: "Posible coincidencia!" with "MATCH IDENTIFICADO"
- Subtitle: algorithm found high-precision biometric match
- **Side-by-side comparison:** Found dog vs. database record
- **Confidence Badge:** "Confianza biometrica 98% de precision" with 3 verification checkmarks
- **Owner Profile Card:**
  - Dog name, breed, age (e.g. Oliver, Golden Retriever, 3 anos)
  - Owner name (partially visible)
  - Phone number (masked)
  - Location
- CTAs: "Notificar al dueno ahora" (primary) / "No es este perro" (secondary)
- Footer: "Peanut esta disenado para reunir familias"

### 4.5 Community & Alerts

#### Feed Comunidad
- Tab filters: Todos, Cerca de mi, Perdidos, Encontrados
- **Pet Cards:** Each shows:
  - Status badge (Perdido / Encontrado)
  - Distance (e.g. "a 500m")
  - Pet name and breed
  - Location
  - Photo
- Example entries: Bruno (Beagle, lost), Desconocido (Husky, found), Lola (Caniche Toy, lost), Cooper (Labrador, found)

#### Alertas (Notifications)
- Tab filters: Todo, Mis Perros, Cerca
- **Notification Types:**
  - **Security Alert:** "Tu perro ha sido escaneado" — scan location, contact button
  - **Sighting Report:** "Nuevo avistamiento a 2km" — user-reported sighting
  - **Critical Alert:** "Perro perdido cerca de ti" — lost dog nearby
  - **Tip:** "Mantener tu biometria actualizada aumenta en un 85% las probabilidades de reencuentro"

#### Alertas (List View)
- Category tabs: PERDIDO, AVISTADO, SEGURO
- Search field
- Pet cards with status, timestamp, name, location
- Quick actions: "Ver Detalles" / "Avisar dueno"

### 4.6 Profile & Settings

#### Perfil de Usuario
- User greeting with location ("Hola, Alejandro — Madrid, Espana")
- **Mis Perros:** Dog cards with name, breed, age, verification status. "Anadir nuevo" button
- **Mis Reportes:** Report history (e.g. "Bruno encontrado — 2 months ago")
- **Quick Settings:**
  - Zonas de interes — "Radio de alertas: 5km"
  - Contactos de emergencia — "2 contactos configurados"
  - Cerrar sesion

#### Ajustes (Settings)
- **Profile Card:** Name, email, verified badge
- **Cuenta y Seguridad:** Editar Perfil, Notificaciones
- **Privacidad:** Privacidad, Permisos de Ubicacion
- **Soporte y Legal:** Ayuda y Soporte, Terminos y Condiciones
- **Danger Zone:** Eliminar cuenta
- Footer: "Peanut v2.4.0 — Made with care for pets"

---

## 5. Component Library

### Biometric Card
- Base: `surface_container_lowest` with `xl` (3rem) radius
- Border: Ghost border (10% `outline_variant`)
- Content: Large pet image with overlapping `secondary_container` badge for "Verified Nose Print"

### Action Buttons
- **Primary (Urgent):** Gradient fill (`primary` -> `primary_container`), `full` radius, `title-sm` typography
- **Secondary (Safety):** `secondary_container` fill with `on_secondary_container` text

### Input Fields
- Background: `surface_variant` with bottom-heavy `md` (1.5rem) radius
- Focus state: Background shifts to `surface_container_highest`, 2px ghost border in `primary`

### Status Badges
- **Protegido/Seguro:** `tertiary_container` background
- **Perdido/Extraviado:** `error` background with `on_error` text
- **Avistado:** `secondary_container` background
- **Verificado:** `secondary_container` with checkmark icon

### List Items
- No `<hr>` dividers — items separated by `spacing-4` vertical gap or nested in `surface_container_low` capsules with `lg` radius

### Cards
- Minimum radius: `md` (1.5rem) for any container larger than a button
- Elevation through tonal layering, not drop shadows

---

## 6. Do's and Don'ts

### Do
- Use asymmetrical layouts — photos can bleed off screen edges
- Use `primary_fixed` (#ffdbcd) for subtle background highlights
- Prioritize warm-lit, home-style photography
- Ensure text on surfaces meets WCAG AA standards
- Use `on_surface_variant` (#564337) for secondary text legibility

### Don't
- Use pure black (#000000) — always use `on_background` (#1e1b13)
- Use radius smaller than `md` (1.5rem) for containers larger than buttons
- Cram information — move overflow to nested surfaces or horizontal carousels
- Use 1px borders to define sections — use background color shifts instead
- Use heavy drop shadows — depth is a whisper, not a shout

---

## 7. Stitch Project Reference

- **Project ID:** `12643697214586868215`
- **Device:** Mobile (390px width)
- **Total Screens:** 19 UI screens + 1 PRD document
- **Design System:** Editorial Biometrics (Light mode, Full roundness, Spacing scale 3)
