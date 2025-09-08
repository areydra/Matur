# Matur Chat App

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Architecture Overview

This app features a comprehensive authentication and onboarding system with the following architecture:

- **Frontend**: React Native with Expo Router for navigation
- **Authentication**: Supabase Auth with Google OAuth integration
- **State Management**: Zustand for navigation and user state
- **Secure Storage**: MMKV for encrypted authentication token storage
- **Backend**: Supabase (Database + Storage)
- **Image Processing**: Expo ImagePicker with Supabase Storage

## Key Features

1. **Onboarding Flow**: Multi-slide product tour introduction
2. **Google Authentication**: Seamless OAuth integration via Supabase
3. **Profile Setup**: Name input and profile image upload with validation
4. **State Management**: Zustand stores for navigation and user data
5. **Secure Storage**: MMKV for encrypted auth token persistence
6. **Error Handling**: Comprehensive error recovery and retry logic

## Get started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Set up environment variables

   ```bash
   cp .env.example .env
   ```
   
   Then update `.env` with your actual Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   EXPO_PUBLIC_MMKV_ENCRYPTION_KEY=your_secure_encryption_key_here
   ```

3. Configure Supabase (see detailed setup instructions below)

4. Start the app

   ```bash
   yarn start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Project Structure

```
app/
├── (tabs)/              # Main app tabs (after authentication)
├── onboarding/          # Onboarding flow screens
│   ├── index.tsx        # Product tour slides
│   ├── login.tsx        # Google authentication
│   └── terms.tsx        # Terms and conditions
├── setup-account/       # Profile setup flow
│   ├── index.tsx        # Name and image upload
│   └── _layout.tsx      # Setup layout with header
└── _layout.tsx          # Root layout with auth logic

src/
├── components/          # Reusable UI components
│   └── Header.tsx       # Custom header with back button
├── store/              # Zustand state management
│   ├── navigationStore.ts # Navigation state
│   └── userStore.ts     # User authentication state
└── utils/
    └── theme.ts         # Design system (colors, typography, spacing)

lib/
└── supabase.ts          # Supabase client configuration
```

## Dependencies

Key dependencies used in this project:

- **@supabase/supabase-js**: Backend authentication and database
- **@react-native-google-signin/google-signin**: Google OAuth integration
- **zustand**: Lightweight state management
- **react-native-mmkv**: Fast, secure key-value storage for auth tokens
- **expo-image-picker**: Native image selection functionality
- **expo-file-system**: File system operations for image processing
- **base64-arraybuffer**: Image format conversion for uploads
- **expo-linear-gradient**: Gradient styling for UI components

## Supabase Setup Instructions

### 1. Environment Configuration

The app uses environment variables for secure configuration. After copying `.env.example` to `.env`, update with your values:

```env
# Your Supabase project URL
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anon/public key  
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Encryption key for MMKV auth storage (generate a secure random string)
EXPO_PUBLIC_MMKV_ENCRYPTION_KEY=your_32_character_encryption_key
```

**Security Notes**:
- The `MMKV_ENCRYPTION_KEY` should be a secure, randomly generated string
- Never commit your actual `.env` file to version control
- Environment variables are validated on app startup in `lib/supabase.ts`

### 2. Database Setup

Create a `profiles` table in your Supabase database with the following schema:

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Enable RLS
alter table profiles enable row level security;

-- Create policies
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);
```

### 3. Storage Setup

Create an `avatars` bucket in Supabase Storage with the following policies:

```sql
-- Allow users to upload their own avatar
create policy "Users can upload their own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid() = owner);

-- Allow users to update their own avatar
create policy "Users can update their own avatar" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid() = owner);

-- Allow public access to avatars
create policy "Avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');
```

### 4. Google OAuth Configuration

#### Supabase Setup:
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret
4. Add redirect URLs:
   - For development: `exp://127.0.0.1:19000/--/auth/callback`
   - For production: `matur://auth/callback`

#### Google Cloud Console Setup:
1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google+ API
3. Create OAuth 2.0 credentials:
   - **Web Client ID**: Used in Supabase configuration
   - **iOS Client ID**: Used in `app/onboarding/login.tsx`
4. Add authorized redirect URIs in Google Console to match Supabase settings

### 5. Deep Linking Setup

Update your `app.json` to include the deep linking configuration:

```json
{
  "expo": {
    "scheme": "matur",
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ]
    ]
  }
}
```

## Authentication Flow

The app implements a comprehensive authentication and onboarding flow:

### 1. App Initialization (`app/_layout.tsx`)
- Loads fonts and configures splash screen
- Checks authentication status using Supabase session
- Routes users based on authentication and profile completion status:
  - **Not authenticated** → `/onboarding`
  - **Authenticated but incomplete profile** → `/setup-account`  
  - **Authenticated with complete profile** → `/(tabs)`

### 2. Onboarding Flow (`app/onboarding/`)
- **Product Tour** (`index.tsx`): 3-slide introduction to app features
- **Google Authentication** (`login.tsx`): OAuth integration with comprehensive error handling
- **Terms & Conditions** (`terms.tsx`): Legal requirements display

### 3. Profile Setup (`app/setup-account/`)
- **Name Input**: Real-time validation (minimum 2 characters)
- **Profile Image**: Expo ImagePicker with Supabase Storage upload
- **Error Recovery**: Retry logic for failed uploads with platform-specific handling
- **Database Storage**: User profile saved to `profiles` table

### 4. State Management
- **Navigation Store** (`src/store/navigationStore.ts`): Manages flow state (onboarding → setup → home)
- **User Store** (`src/store/userStore.ts`): Handles authentication state and user data
- **MMKV Storage**: Encrypted persistence for auth tokens

### 5. Error Handling
- Network connectivity issues
- Google Sign-In specific errors (cancelled, in progress, services unavailable)
- Image upload failures with retry mechanisms
- Form validation with real-time feedback
- User-friendly error messages with developer details in debug mode

## Development Scripts

```bash
# Start development server
yarn start

# Platform-specific development builds
yarn android:dev          # Android development build
yarn ios:dev              # iOS development build
yarn android:dev:release  # Android release build  
yarn ios:dev:release      # iOS release build

# Standard platform builds
yarn android              # Standard Android build
yarn ios                  # Standard iOS build
yarn web                  # Web build

# Code quality
yarn lint                 # Run ESLint
```

## Learn more

To learn more about developing your project, check out these resources:

- **[Expo documentation](https://docs.expo.dev/)**: Learn fundamentals and advanced topics
- **[Expo Router](https://docs.expo.dev/router/introduction/)**: File-based navigation system
- **[Supabase documentation](https://supabase.com/docs)**: Authentication, database, and storage
- **[Zustand](https://docs.pmnd.rs/zustand/)**: Simple state management
- **[MMKV](https://github.com/mrousavy/react-native-mmkv)**: Fast, secure storage
- **[Google Sign-In](https://github.com/react-native-google-signin/google-signin)**: OAuth integration
- **[Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)**: Native image selection

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Supabase on GitHub](https://github.com/supabase/supabase): View the Supabase open source platform.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
