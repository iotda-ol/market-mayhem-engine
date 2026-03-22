# Market Mayhem Mobile

React Native / Expo mobile app for the Market Mayhem trading game engine.

## Prerequisites

- Node.js ≥ 18
- [Expo Go](https://expo.dev/go) on your iOS or Android device (for development)
- Or an Android/iOS emulator

## Setup

```bash
cd apps/mobile
npm install
```

## Running

```bash
# Start the Expo dev server (scan QR code with Expo Go)
npm start

# Run on Android emulator / device
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Run in browser (limited functionality)
npm run web
```

## Configuration

By default, the app connects to `http://localhost:3001` (the backend API).

**For a physical device**, you must set `EXPO_PUBLIC_API_URL` to your machine's LAN IP:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:3001 npm start
```

Or create a `.env.local` file in `apps/mobile/`:

```
EXPO_PUBLIC_API_URL=http://192.168.1.10:3001
```

Make sure the backend is running:

```bash
# From the repo root
npm run dev:backend
```

## Architecture

The mobile app mirrors the web frontend (`apps/frontend`) with these key differences:

| Web Frontend | Mobile App |
|---|---|
| React + Vite | React Native + Expo |
| `div`, `button`, etc. | `View`, `TouchableOpacity`, etc. |
| CSS-in-JS objects | `StyleSheet.create()` |
| `localStorage` | `AsyncStorage` |
| `import.meta.env` | `process.env.EXPO_PUBLIC_*` |

### Screen Inventory

| Screen | Description |
|---|---|
| `LobbyScreen` | Character name and loadout selection |
| `MarketScreen` | Buy/sell stocks at current location |
| `TravelScreen` | Choose next location |
| `EncounterScreen` | Resolve random encounter (pay/run/fight) |
| `ShopScreen` | Buy items at the black market |
| `MarketUpdateScreen` | Review price changes and advance turn |
| `GameOverScreen` | Final results and replay option |
