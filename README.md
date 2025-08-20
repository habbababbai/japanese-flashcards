# Japanese Flashcards

A React Native flashcard app for learning Japanese hiragana and katakana characters.

## Features

-   Interactive flashcard flipping
-   Hiragana and katakana learning modes
-   Progress tracking with mistake counting
-   Clean, intuitive UI

## Tech Stack

-   React Native with Expo
-   TypeScript
-   React Navigation (planned)

## Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   npm or yarn
-   Expo CLI (`npm install -g @expo/cli`)
-   iOS Simulator (Xcode) or Android Emulator (Android Studio) - optional
-   Expo Go app on your phone - for mobile testing

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd japanese-flashcards
```

2. Install dependencies:

```bash
yarn install
```

3. Start the development server:

```bash
yarn start
```

### Running the App

After running `yarn start`, you'll see several options:

-   **Press 'i'** - Open iOS simulator
-   **Press 'a'** - Open Android emulator
-   **Press 'w'** - Open in web browser
-   **Scan QR code** - Open on your phone with Expo Go app

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # App screens
├── types/          # TypeScript type definitions
├── data/           # Sample data and constants
└── utils/          # Utility functions
```

## Development

-   **Main entry point**: `App.tsx`
-   **TypeScript config**: `tsconfig.json`
-   **Expo config**: `app.json`

## Roadmap

-   [ ] Basic flashcard component
-   [ ] Hiragana and katakana data
-   [ ] Progress tracking
-   [ ] Navigation between screens
-   [ ] Kanji support (future)
-   [ ] Spaced repetition (future)

## Contributing

This is a personal learning project. Feel free to fork and experiment!

## License

MIT
