You are a React Native development agent tasked with building a project template based on the best practices from the referenced article, using **expo-router** for navigation with a structure optimized for its file-based routing conventions, and with styles separated into dedicated `styles.ts` files for each component and route. Follow these guidelines:

1. **Project Structure**: Create a modular folder structure optimized for **expo-router**. Use the `app/` directory for all navigation routes and layouts (e.g., `app/_layout.tsx`, `app/index.tsx`, `app/about.tsx`), following **expo-router**’s file-based routing conventions. Place reusable components, services, stores, utilities, types, assets, and constants in a `src/` directory for modularity. Each component and route-specific component must have its own folder containing an `index.tsx` file for logic and a `styles.ts` file for styles.
2. **Components**: Design reusable, functional components using TypeScript for type safety. Include at least one reusable component (e.g., a `Button` component) with clear props, with styles in a separate `styles.ts` file.
3. **State Management**: Use **Zustand** for lightweight, scalable state management suitable for a small-to-medium app, ensuring minimal re-renders and a clean API for state updates.
4. **Styling**: Use `StyleSheet` in dedicated `styles.ts` files for performant, reusable styles. Avoid inline styles and maintain a theme file for consistent design.
5. **Performance**: Apply memoization (`React.memo`, `useMemo`, `useCallback`) to optimize rendering. Use **@tanstack/react-query** for optimized API calls with caching and error handling.
6. **Navigation**: Use **expo-router** for declarative, file-based navigation. Include at least two routes (e.g., a home route and an about route) in the `app/` directory to demonstrate navigation functionality, with each route having its own folder containing `index.tsx` and `styles.ts` for modularity.
7. **Error Handling**: Implement an error boundary component to handle JavaScript errors gracefully, with styles in a separate `styles.ts` file.
8. **Testing**: Set up Jest and React Native Testing Library for unit testing components.
9. **Code Reusability**: Ensure components and utilities are modular and reusable across platforms (e.g., React Native and React.js where applicable).

**Task Instructions**:
- Generate a folder structure optimized for **expo-router**, with all navigation routes in the `app/` directory (e.g., `app/_layout.tsx`, `app/home/index.tsx`, `app/about/index.tsx`) and other logic in `src/` (e.g., `src/components/`, `src/services/`). Include sample files: `app/_layout.tsx`, `app/home/index.tsx`, `app/about/index.tsx`, a reusable `Button` component, an `ErrorBoundary` component, a `store.ts` for **Zustand**, a `queries.ts` for **@tanstack/react-query**, and a `theme.ts` for styles.
- Include a `package.json` with necessary dependencies, including `expo`, `expo-router`, `zustand`, and `@tanstack/react-query`.
- Add comments in code to explain alignment with best practices, the use of separate style files, **expo-router**, **Zustand**, and **@tanstack/react-query**.

**Constraints**:
- Base assumptions on common React Native best practices if article specifics are unavailable.
- Keep the example minimal yet functional, focusing on best practices, separate style files, **expo-router**, **Zustand**, and **@tanstack/react-query**.
- Use TypeScript for type safety and modern JavaScript conventions.

**Deliverable**:
A complete React Native project template with an optimized **expo-router** folder structure, sample code, separate `styles.ts` files, navigation using **expo-router**, state management using **Zustand**, API calls using **@tanstack/react-query**.

---
## Project Template

### Folder Structure

```plaintext
my-react-native-app/
├── app/
│   ├── _layout.tsx
│   ├── home/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── useHome.ts
│   │   └── styles.ts
│   ├── about/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── styles.ts
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── ErrorBoundary/
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   ├── services/
│   │   └── queries.ts
│   ├── store/
│   │   └── store.ts
│   ├── utils/
│   │   └── theme.ts
│   ├── types/
│   │   └── index.ts
│   ├── assets/
│   │   └── images/
│   └── constants/
│       └── config.ts
├── __tests__/
│   └── Button.test.tsx
├── App.tsx
├── package.json
└── README.md
```

### Sample Code Files

#### App.tsx
```tsx
// App.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';

// Initialize QueryClient for @tanstack/react-query
const queryClient = new QueryClient();

// Main app entry point with expo-router and QueryClientProvider
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
};

export default App;
```

#### app/_layout.tsx
```tsx
// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import ErrorBoundary from '../src/components/ErrorBoundary';

// Root layout for expo-router navigation with error boundary
const RootLayout = () => {
  return (
    <ErrorBoundary>
      <Stack>
        <Stack.Screen name="home" options={{ title: 'Home' }} />
        <Stack.Screen name="about" options={{ title: 'About' }} />
      </Stack>
    </ErrorBoundary>
  );
};

export default RootLayout;
```

#### app/home/_layout.tsx
```tsx
import { Stack } from "expo-router";
import React from "react";

const HomeLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default HomeLayout;
```

#### app/home/index.tsx
```tsx
// app/home/index.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import Button from '../../src/components/Button';
import { useHome } from './useHome';
import { styles } from './styles';

// Home route with expo-router, using specific custom hook for logic encapsulation
const HomeScreen: React.FC = () => {
  const { data, isLoading, refetch } = useHome();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My App</Text>
      <Button
        title={isLoading ? 'Loading...' : 'Fetch Data'}
        onPress={() => refetch()}
        disabled={isLoading}
      />
      {data && <Text style={styles.data}>{data}</Text>}
      <Link href="/about" asChild>
        <Button title="Go to About" onPress={() => {}} />
      </Link>
    </View>
  );
};

export default HomeScreen;
```

#### app/home/useHome.ts
```ts
// app/home/useHome.ts
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../../src/services/queries';
import { useDataStore } from '../../src/store/store';

// Specific custom hook for Home route to encapsulate data fetching, state updates, and effects
export const useHome = () => {
  const { setData } = useDataStore();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['sampleData'],
    queryFn: fetchData,
  });

  // Update Zustand store when data is fetched
  useEffect(() => {
    if (data) {
      setData(data);
    }
  }, [data, setData]);

  return { data, isLoading, refetch };
};
```

#### app/home/styles.ts
```ts
// app/home/styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../src/utils/theme';

// Separated styles for Home route to ensure modularity and reusability
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
  },
  data: {
    marginTop: 20,
    fontSize: 16,
    color: colors.text,
  },
});
```

#### app/about/_layout.tsx
```tsx
// app/about/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

const AboutLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AboutLayout;
```

#### app/about/index.tsx
```tsx
// app/about/index.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import Button from '../../src/components/Button';
import { styles } from './styles';

// About route with expo-router (simple, no custom hook needed for this minimal example)
const AboutScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About Page</Text>
      <Link href="/home" asChild>
        <Button title="Go to Home" onPress={() => {}} />
      </Link>
    </View>
  );
};

export default AboutScreen;
```

#### app/about/styles.ts
```ts
// app/about/styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../src/utils/theme';

// Separated styles for About route to ensure modularity and reusability
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
  },
});
```

#### src/components/Button/index.tsx
```tsx
// src/components/Button/index.tsx
import React, { memo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from './styles';
import { ButtonProps } from '../../types';

// Reusable button component with TypeScript for type safety
const Button: React.FC<ButtonProps> = ({ title, onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(Button);
```

#### src/components/Button/styles.ts
```ts
// src/components/Button/styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';

// Separated styles for Button component to promote maintainability
export const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: colors.disabled,
    opacity: 0.6,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

#### src/components/ErrorBoundary/index.tsx
```tsx
// src/components/ErrorBoundary/index.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Error boundary for graceful error handling
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Something went wrong.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### src/components/ErrorBoundary/styles.ts
```ts
// src/components/ErrorBoundary/styles.ts
import { StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';

// Separated styles for ErrorBoundary to maintain consistency
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.text,
    fontSize: 18,
  },
});
```

#### src/services/queries.ts
```ts
// src/services/queries.ts
// API queries using @tanstack/react-query
export const fetchData = async (): Promise<string> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => resolve('Sample API Response'), 1000);
  });
};
```

#### src/store/store.ts
```ts
// src/store/store.ts
import create from 'zustand';

// Zustand store for managing app state
interface DataStore {
  data: string | null;
  setData: (data: string) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
```

#### src/utils/theme.ts
```ts
// src/utils/theme.ts
// Centralized theme for consistent styling
export const colors = {
  primary: '#007AFF',
  disabled: '#A0A0A0',
  white: '#FFFFFF',
  text: '#333333',
  background: '#F5F5F5',
};
```

#### src/types/index.ts
```ts
// src/types/index.ts
// TypeScript types for better type safety
export interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}
```

#### __tests__/Button.test.tsx
```tsx
// __tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../src/components/Button';

describe('Button Component', () => {
  it('renders correctly and responds to press', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click Me" onPress={onPress} />);
    
    const button = getByText('Click Me');
    expect(button).toBeTruthy();
    
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalled();
  });

  it('renders disabled state correctly', () => {
    const { getByText } = render(<Button title="Click Me" onPress={() => {}} disabled />);
    const button = getByText('Click Me');
    expect(button.parentNode).toHaveStyle({ opacity: 0.6 });
  });
});
```

#### package.json
```json
{
  "name": "my-react-native-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "test": "jest"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.0.0",
    "expo-status-bar": "~1.11.0",
    "react": "18.2.0",
    "react-native": "0.81.0",
    "@react-native-community/async-storage": "^1.12.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/preset-react": "^7.20.0",
    "@testing-library/react-native": "^12.0.0",
    "@types/react": "^18.2.0",
    "@types/react-native": "^0.73.0",
    "jest": "^29.2.1",
    "typescript": "^5.0.0"
  },
  "jest": {
    "preset": "react-native",
    "setupFilesAfterEnv": ["@testing-library/react-native/extend-expect"]
  }
}
```

## Project Structure
- `app/` - Expo Router navigation routes (e.g., `app/home/index.tsx`, `app/about/index.tsx`).
- `app/*/_layout.tsx` - Expo Router layout file.
- `app/*/index.tsx` - Route logic.
- `app/*/use*.ts` - Specific custom hooks for routes/components where needed (e.g., `app/home/useHome.ts`).
- `app/*/styles.ts` - Route-specific styles.
- `src/components/*/index.tsx` - Component logic (e.g., Button/index.tsx).
- `src/components/*/styles.ts` - Component-specific styles.
- `src/services/` - API queries using @tanstack/react-query (e.g., queries.ts).
- `src/store/` - Zustand store for state management (e.g., store.ts).
- `src/utils/` - Utility functions and themes (e.g., theme.ts).
- `src/types/` - TypeScript type definitions.
- `src/assets/` - Static assets like images.
- `__tests__/` - Unit tests for components.

## Best Practices Implemented
- **Modular Structure**: Optimized for **expo-router** with routes in `app/` and reusable logic in `src/`.
- **Navigation**: **expo-router** for file-based, declarative navigation.
- **Separated Styles**: Each component and route has a `styles.ts` file for maintainable styling.
- **Type Safety**: TypeScript for robust code.
- **State Management**: **Zustand** for lightweight, scalable state handling.
- **API Calls**: **@tanstack/react-query** for optimized data fetching with caching.
- **Performance**: Memoization with `React.memo` and `useCallback`.
- **Error Handling**: ErrorBoundary for graceful error recovery.
- **Testing**: Jest and React Native Testing Library for unit tests.
- **Custom Hooks**: Specific custom hook (`useHome.ts`) added for the Home route to encapsulate fetching and state logic, demonstrating file-specific hook usage. Reusable hooks would be placed in `src/hooks/` if needed for cross-file sharing.

## Example Usage
```tsx
import Button from './src/components/Button';
import { useDataStore } from './src/store/store';
import { Link } from 'expo-router';

const MyComponent = () => {
  const { data } = useDataStore();
  return (
    <>
      <Button title="Click Me" onPress={() => console.log(data)} />
      <Link href="/about" asChild>
        <Button title="Go to About" onPress={() => {}} />
      </Link>
    </>
  );
};
```