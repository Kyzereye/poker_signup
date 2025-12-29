# Capacitor Mobile App Implementation Plan

## Overview
This plan outlines the conversion of the Angular web application into a native mobile app using Capacitor. Capacitor allows you to wrap the existing Angular application and deploy it to iOS and Android without needing to rewrite the codebase.

## Current State
- Angular 18.2.0 standalone application
- Node.js/Express backend API
- MySQL database
- JWT authentication
- Material Design UI
- Responsive design (partially implemented)

## Benefits of Capacitor
- Use the same Angular codebase for web and mobile
- Access to native device features (camera, notifications, file system, etc.)
- Better performance than Cordova
- Modern tooling and active development
- Easy integration with existing Angular projects
- No need for separate mobile codebase

## Prerequisites

### Development Environment Setup

#### For iOS Development:
- macOS (required for iOS builds)
- Xcode (latest version from App Store)
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods: `sudo gem install cocoapods`

#### For Android Development:
- Java Development Kit (JDK) 17 or higher
- Android Studio (latest version)
- Android SDK
- Set ANDROID_HOME environment variable
- Add Android platform-tools to PATH

#### For Both:
- Node.js 18+ (already have)
- npm or yarn package manager

## Implementation Phases

---

## **PHASE 1: Capacitor Installation and Initial Setup**

### 1.1 Install Capacitor CLI and Core Package
**Location**: `frontend/` directory

```bash
cd frontend
npm install @capacitor/core @capacitor/cli
```

### 1.2 Initialize Capacitor
**Command**: 
```bash
npx cap init
```

**Configuration prompts**:
- App name: `Poker Sign-Up` (or your preferred name)
- App ID: `com.yourcompany.pokersignup` (reverse domain notation)
- Web directory: `dist/frontend` (matches Angular output path)

This creates `capacitor.config.ts` in the frontend directory.

### 1.3 Install Platform Packages
**For iOS and Android**:
```bash
npm install @capacitor/ios @capacitor/android
```

**Optional but recommended plugins**:
```bash
npm install @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen
```

### 1.4 Update capacitor.config.ts
Configure Capacitor settings for your app:

**Key settings to configure**:
- `server.url` - For live reload during development (optional)
- `android.buildOptions.keystorePath` - For release builds
- `ios.scheme` - Custom URL scheme for deep linking
- `plugins` - Configure installed plugins

---

## **PHASE 2: Build Configuration**

### 2.1 Update Angular Build Output
**File**: `frontend/angular.json`

Ensure production build output is correct:
- Output path: `dist/frontend` (should already be set)
- Ensure `optimization: true` for production builds
- Verify `sourceMap: false` for production (smaller bundle size)

### 2.2 Add Build Scripts
**File**: `frontend/package.json`

Add new scripts for mobile development:
```json
{
  "scripts": {
    "build:mobile": "ng build --configuration production",
    "sync:ios": "npx cap sync ios",
    "sync:android": "npx cap sync android",
    "open:ios": "npx cap open ios",
    "open:android": "npx cap open android",
    "copy:ios": "npx cap copy ios",
    "copy:android": "npx cap copy android"
  }
}
```

### 2.3 Build the Angular App
**First build**:
```bash
npm run build:mobile
```

This creates the `dist/frontend` directory with production-ready files.

---

## **PHASE 3: Platform Integration**

### 3.1 Add iOS Platform
**Command**:
```bash
npx cap add ios
```

This creates:
- `ios/` directory with native iOS project
- Xcode project files
- Platform-specific configurations

### 3.2 Add Android Platform
**Command**:
```bash
npx cap add android
```

This creates:
- `android/` directory with native Android project
- Gradle build files
- Platform-specific configurations

### 3.3 Sync Web Assets to Platforms
**Command**:
```bash
npx cap sync
```

This copies the built web app into both platforms and updates native dependencies.

---

## **PHASE 4: Mobile-Specific Code Adjustments**

### 4.1 Update index.html Viewport Meta Tag
**File**: `frontend/src/index.html`

Ensure mobile viewport is configured:
```html
<meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

The `viewport-fit=cover` is important for devices with notches (iPhone X+).

### 4.2 Handle Safe Areas (iOS Notch Support)
**File**: `frontend/src/styles.scss`

Add CSS variables for safe areas:
```scss
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-right: env(safe-area-inset-right);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
}

body {
  padding-top: var(--safe-area-inset-top);
  padding-left: var(--safe-area-inset-left);
  padding-right: var(--safe-area-inset-right);
  padding-bottom: var(--safe-area-inset-bottom);
}
```

### 4.3 Touch Target Sizes
**File**: `frontend/src/styles.scss`

Ensure touch targets meet mobile guidelines (minimum 44x44px):
```scss
button, a, .clickable {
  min-height: 44px;
  min-width: 44px;
}
```

### 4.4 Disable Text Selection (Optional)
**File**: `frontend/src/styles.scss`

Prevent accidental text selection on mobile:
```scss
body {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

input, textarea {
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}
```

### 4.5 Handle Back Button (Android)
**File**: `frontend/src/app/app.component.ts`

Import and handle Android back button:
```typescript
import { App } from '@capacitor/app';

// In ngOnInit or constructor
App.addListener('backButton', ({ canGoBack }) => {
  if (!canGoBack) {
    App.exitApp();
  } else {
    // Handle navigation
    window.history.back();
  }
});
```

### 4.6 Configure Status Bar
**File**: `frontend/src/app/app.component.ts`

Set status bar styling:
```typescript
import { StatusBar, Style } from '@capacitor/status-bar';

// In ngOnInit
StatusBar.setStyle({ style: Style.Light });
StatusBar.setBackgroundColor({ color: '#ffffff' });
```

---

## **PHASE 5: API and Network Configuration**

### 5.1 Update Environment Variables
**Files**: 
- `frontend/src/environments/environment.ts`
- `frontend/src/environments/environment.prod.ts`

For mobile, you'll need to use your server's actual IP/domain instead of `localhost`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://your-server-ip:3333' // Or your domain
};
```

### 5.2 Handle CORS
**File**: `backend/index.js`

Ensure backend allows requests from mobile app origins. For Capacitor, you may need to:
- Allow requests from `capacitor://localhost` (iOS)
- Allow requests from `http://localhost` (Android)
- Or configure to allow all origins in development

### 5.3 Network Error Handling
**File**: `frontend/src/app/interceptors/http.interceptor.ts`

Add mobile-specific network error handling:
```typescript
import { Network } from '@capacitor/network';

// Check network status before requests
const status = await Network.getStatus();
if (!status.connected) {
  // Show offline message
}
```

---

## **PHASE 6: Native Feature Integration (Optional)**

### 6.1 Install Additional Plugins (As Needed)

**Common useful plugins**:
```bash
# Camera
npm install @capacitor/camera

# File system
npm install @capacitor/filesystem

# Geolocation
npm install @capacitor/geolocation

# Local notifications
npm install @capacitor/local-notifications

# Push notifications
npm install @capacitor/push-notifications

# Share
npm install @capacitor/share

# Storage (alternative to localStorage)
npm install @capacitor/preferences
```

### 6.2 Configure Permissions

**iOS**: Edit `ios/App/App/Info.plist`
Add permission descriptions for camera, location, etc.

**Android**: Edit `android/app/src/main/AndroidManifest.xml`
Add permission declarations as needed.

---

## **PHASE 7: Platform-Specific Configuration**

### 7.1 iOS Configuration

**7.1.1 App Icons and Splash Screens**
- Place app icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Place splash screens in `ios/App/App/Assets.xcassets/Splash.imageset/`
- Or use Capacitor's resources CLI: `npx cap assets`

**7.1.2 Bundle Identifier**
Edit `ios/App/App.xcodeproj/project.pbxproj` or use Xcode to set:
- Bundle Identifier: `com.yourcompany.pokersignup`
- Display Name: `Poker Sign-Up`
- Version: Set appropriate version number

**7.1.3 Signing & Capabilities**
In Xcode:
- Select project → Signing & Capabilities
- Configure Team/Provisioning Profile for development
- Add capabilities as needed (Push Notifications, Background Modes, etc.)

**7.1.4 Info.plist Settings**
Edit `ios/App/App/Info.plist`:
- Set `NSAppTransportSecurity` if needed (for HTTP connections)
- Configure URL schemes for deep linking
- Set orientation preferences

### 7.2 Android Configuration

**7.2.1 App Icons and Splash Screens**
- Place icons in `android/app/src/main/res/mipmap-*/`
- Configure in `android/app/src/main/res/values/styles.xml`
- Or use Capacitor's resources CLI

**7.2.2 Application ID**
Edit `android/app/build.gradle`:
```gradle
applicationId "com.yourcompany.pokersignup"
versionCode 1
versionName "1.0.0"
```

**7.2.3 Permissions**
Edit `android/app/src/main/AndroidManifest.xml`:
- Add internet permission (usually already present)
- Add other permissions as needed

**7.2.4 ProGuard Rules (for release builds)**
Edit `android/app/proguard-rules.pro` if using code obfuscation:
- Add rules to keep Capacitor classes
- Add rules for your Angular app

---

## **PHASE 8: Testing**

### 8.1 iOS Testing

**8.1.1 Open in Xcode**:
```bash
npm run build:mobile
npx cap sync ios
npx cap open ios
```

**8.1.2 Test on Simulator**:
- In Xcode: Product → Destination → Select simulator
- Click Run button (or Cmd+R)

**8.1.3 Test on Physical Device**:
- Connect iOS device via USB
- In Xcode: Select device as destination
- May need to configure signing/provisioning
- Click Run

### 8.2 Android Testing

**8.2.1 Open in Android Studio**:
```bash
npm run build:mobile
npx cap sync android
npx cap open android
```

**8.2.2 Test on Emulator**:
- In Android Studio: Run → Select emulator
- Or use command line: `./gradlew installDebug` then launch emulator

**8.2.3 Test on Physical Device**:
- Enable Developer Options on Android device
- Enable USB Debugging
- Connect device via USB
- In Android Studio: Select device and Run

### 8.3 Testing Checklist

- [ ] App launches correctly
- [ ] Login functionality works
- [ ] API calls succeed (check network configuration)
- [ ] Navigation works
- [ ] Forms are usable (keyboard doesn't cover inputs)
- [ ] Touch targets are appropriate size
- [ ] Status bar styling is correct
- [ ] Back button behavior (Android)
- [ ] Safe areas respected (iOS notch devices)
- [ ] Orientation handling (if needed)
- [ ] App icons and splash screens display correctly

---

## **PHASE 9: Build for Production**

### 9.1 iOS Production Build

**9.1.1 Prepare for Release**:
1. Update version number in Xcode
2. Configure signing with distribution certificate
3. Set build configuration to Release

**9.1.2 Archive and Export**:
1. In Xcode: Product → Archive
2. Wait for archive to complete
3. Window → Organizer opens
4. Select archive → Distribute App
5. Choose distribution method (App Store, Ad Hoc, Enterprise)

**9.1.3 App Store Submission**:
- Create App Store Connect listing
- Upload build via Xcode or Transporter
- Submit for review

### 9.2 Android Production Build

**9.2.1 Generate Signing Key**:
```bash
keytool -genkey -v -keystore poker-signup-release.keystore -alias poker-signup -keyalg RSA -keysize 2048 -validity 10000
```

**9.2.2 Configure Signing**:
Edit `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('path/to/poker-signup-release.keystore')
            storePassword 'your-store-password'
            keyAlias 'poker-signup'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

**9.2.3 Build Release APK/AAB**:
```bash
cd android
./gradlew assembleRelease  # For APK
# OR
./gradlew bundleRelease    # For AAB (recommended for Play Store)
```

Output: `android/app/build/outputs/apk/release/app-release.apk` or `app-release.aab`

**9.2.4 Play Store Submission**:
- Create Google Play Console listing
- Upload AAB file
- Complete store listing information
- Submit for review

---

## **PHASE 10: Development Workflow**

### 10.1 Development Process

**Typical workflow**:
1. Make changes in Angular code
2. Build: `npm run build:mobile`
3. Sync: `npx cap sync` (copies web assets to native projects)
4. Open native IDE: `npx cap open ios` or `npx cap open android`
5. Run/debug in IDE or on device

### 10.2 Live Reload (Optional)

Configure Capacitor for live reload during development:

**Update `capacitor.config.ts`**:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.pokersignup',
  appName: 'Poker Sign-Up',
  webDir: 'dist/frontend',
  server: {
    // For development only - remove for production
    url: 'http://192.168.1.x:4200',
    cleartext: true
  }
};
```

Then run Angular dev server: `ng serve --host 0.0.0.0`

**Note**: Remove `server.url` for production builds!

### 10.3 Version Control

**Files to commit**:
- `capacitor.config.ts`
- `package.json` and `package-lock.json`
- iOS and Android platform folders (optional - can be regenerated)

**Files to add to .gitignore** (if not committing platforms):
- `ios/`
- `android/`
- `*.keystore`
- `*.jks`

---

## **PHASE 11: Mobile-Specific Considerations**

### 11.1 Performance Optimization

**11.1.1 Bundle Size**:
- Use production builds
- Enable tree-shaking
- Lazy load routes
- Optimize images
- Consider code splitting

**11.1.2 Runtime Performance**:
- Use OnPush change detection strategy where possible
- Optimize Angular Material usage (can be heavy)
- Minimize DOM manipulations
- Use virtual scrolling for long lists

### 11.2 User Experience

**11.2.1 Keyboard Handling**:
- Use `@capacitor/keyboard` plugin
- Adjust layout when keyboard appears
- Ensure inputs aren't covered by keyboard

**11.2.2 Haptic Feedback**:
- Use `@capacitor/haptics` for button presses
- Provides tactile feedback on supported devices

**11.2.3 Loading States**:
- Show loading indicators for network requests
- Handle offline scenarios gracefully
- Provide clear error messages

**11.2.4 Navigation**:
- Use Angular Router (already implemented)
- Handle deep linking
- Consider bottom navigation for mobile (if needed)

### 11.3 Security Considerations

**11.3.1 Token Storage**:
- Consider using `@capacitor/preferences` instead of localStorage for sensitive data
- Implement secure storage for tokens

**11.3.2 Certificate Pinning**:
- Consider implementing SSL pinning for production
- Prevents man-in-the-middle attacks

**11.3.3 Code Obfuscation**:
- Use ProGuard for Android
- Consider JavaScript obfuscation tools

---

## **PHASE 12: Ongoing Maintenance**

### 12.1 Updating Capacitor
```bash
npm update @capacitor/core @capacitor/cli
npx cap sync
```

### 12.2 Updating Plugins
```bash
npm update @capacitor/ios @capacitor/android
# Update other plugins as needed
npx cap sync
```

### 12.3 Updating Native Platforms
Capacitor platforms are managed separately:
```bash
npx cap update ios
npx cap update android
```

### 12.4 Version Management
- Keep version numbers synchronized between:
  - `package.json`
  - iOS `Info.plist`
  - Android `build.gradle`
  - App store listings

---

## **Troubleshooting Common Issues**

### Issue: "Web assets not found"
**Solution**: Run `npm run build:mobile` before `npx cap sync`

### Issue: "Plugin not found"
**Solution**: 
1. Install plugin: `npm install @capacitor/plugin-name`
2. Sync: `npx cap sync`
3. May need to rebuild native project

### Issue: "CORS errors in mobile app"
**Solution**: 
- Ensure backend allows Capacitor origins
- Check `capacitor.config.ts` server settings
- Verify API URL in environment files

### Issue: "Build fails in Xcode/Android Studio"
**Solution**:
- Clean build folders
- Delete `ios/Pods` and `ios/Podfile.lock`, then `pod install`
- For Android: `./gradlew clean`

### Issue: "App crashes on launch"
**Solution**:
- Check native logs in Xcode/Android Studio
- Verify all plugins are properly installed
- Check for JavaScript errors in console

---

## **Migration Checklist**

### Pre-Installation
- [ ] Review current Angular application structure
- [ ] Identify any Cordova-specific code (none expected)
- [ ] Document current API endpoints and configurations
- [ ] Backup current codebase

### Installation
- [ ] Install Capacitor CLI and core package
- [ ] Initialize Capacitor configuration
- [ ] Install iOS and Android platforms
- [ ] Install recommended plugins
- [ ] Update package.json scripts

### Configuration
- [ ] Configure capacitor.config.ts
- [ ] Update index.html viewport
- [ ] Add safe area CSS variables
- [ ] Update environment files with production API URLs
- [ ] Configure platform-specific settings

### Code Adjustments
- [ ] Add status bar configuration
- [ ] Handle Android back button
- [ ] Adjust touch target sizes
- [ ] Test keyboard handling
- [ ] Add network status checking (optional)

### Testing
- [ ] Build and test on iOS simulator
- [ ] Build and test on Android emulator
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Verify all functionality works
- [ ] Test API connectivity

### Production
- [ ] Configure iOS signing and capabilities
- [ ] Configure Android signing
- [ ] Generate app icons and splash screens
- [ ] Build release versions
- [ ] Test release builds
- [ ] Submit to app stores

---

## **Additional Resources**

### Official Documentation
- Capacitor: https://capacitorjs.com/docs
- Capacitor iOS: https://capacitorjs.com/docs/ios
- Capacitor Android: https://capacitorjs.com/docs/android
- Capacitor Plugins: https://capacitorjs.com/docs/plugins

### Community Resources
- Capacitor Discord: https://discord.gg/capacitor
- GitHub Issues: https://github.com/ionic-team/capacitor/issues
- Ionic Forum: https://forum.ionicframework.com/

### Related Tools
- Capacitor Assets: For generating icons and splash screens
- App Store Connect: For iOS distribution
- Google Play Console: For Android distribution

---

## **Notes**

- The same Angular codebase is used for web and mobile
- No separate mobile app codebase is needed
- SCSS files remain the same, but mobile-specific responsive styles should be added
- API calls work the same way, but API URL needs to point to actual server (not localhost)
- Native features are optional - start with basic web-to-mobile conversion, then add native features as needed
- Testing on real devices is crucial before production release
- App store submission processes can take time - plan accordingly

