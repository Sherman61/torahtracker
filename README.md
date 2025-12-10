# TorahTracker

A mobile-first web application for tracking Torah learning progress, built with Apache Cordova for Android.

## Overview

TorahTracker helps users track their daily learning progress across multiple Jewish texts:
- **Mishnayes** - Track Mishnah study
- **Tehillim** - Track Psalms reading
- **Chumash** - Track weekly Torah portion (Parsha) study with support for double parshas
- **Gemara** - Track Talmud learning

## Features

- 📱 Mobile-optimized interface with bottom navigation
- 📊 Progress tracking with percentage completion
- 💾 LocalStorage-based persistence (no server required)
- 🌓 Theme support with customizable colors
- 📅 Automatic weekly parsha detection
- ✅ Checkbox interface for daily study tracking
- 🔄 Double parsha support with slider navigation

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- Apache Cordova CLI: `npm install -g cordova`
- Android Studio (for Android builds)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sherman61/torahtracker.git
   cd torahtracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add Android platform:
   ```bash
   cordova platform add android
   ```

4. Build the app:
   ```bash
   cordova build android
   ```

5. Run on device/emulator:
   ```bash
   cordova run android
   ```

### Web Development

For web development without Cordova, simply open `www/index.html` in a browser or use a local server:

```bash
cd www
python -m http.server 8000
# Visit http://localhost:8000
```

## Project Structure

```
torahtracker/
├── www/                    # Web application files
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── img/               # Images and assets
│   ├── themes/            # Theme configurations
│   ├── index.html         # Main entry point (Mishnayes)
│   ├── chumash.html       # Chumash/Parsha tracking
│   ├── teheilem.html      # Tehillim tracking
│   ├── gemorah.html       # Gemara tracking
│   └── settings.html      # App settings
├── android/               # Android platform files
├── resources/             # App icons and splash screens
├── config.xml             # Cordova configuration
└── package.json           # Node dependencies
```

## Data Storage

The app uses browser LocalStorage to persist user data:
- Checkbox states for each study section
- Percentage completion
- Current week's parsha name
- Theme preferences

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache-2.0

## Author

Shiya Sherman - [GitHub Profile](https://github.com/Sherman61)

## Status

⚠️ This project is currently in active development.
