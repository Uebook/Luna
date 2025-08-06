/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import SplashScreen from './src/screen/SplashScreen';
import CreateAccountScreen from './src/screen/CreateAccount';
import LoginScreen from './src/screen/LoginScreen';
import PasswordScreen from './src/screen/PasswordScreen';
import PasswordRecoveryScreen from './src/screen/PasswordRecoveryScreen';
import SetupNewPasswordScreen from './src/screen/SetupNewPasswordScreen';
import PasswordRecoveryScreenS from './src/screen/PasswordRecoveryScreenS';
import OnboardingScreen, { onboardingData } from './src/screen/OnboardingScreen';
import ShopScreen from './src/ShopScreen';
import ReviewScreen from './src/ReviewScreen';
import WishlistScreen from './src/WishlistScreen';
import RecentlyViewedScreen from './src/RecentlyViewedScreen';
import CartScreen from './src/CartScreen';
import ProfileScreen from './src/ProfileScreen';
import ToReceiveOrdersScreen from './src/screen/ToReceiveOrdersScreen';
import OrderTrackingScreen from './src/screen/OrderTrackingScreen';
import HistoryScreen from './src/screen/HistoryScreen';
import ChatBotModal from './src/screen/ChatBotModal';
import RootNavigator from './src/navigation/RootNavigator';
import ActivityScreen from './src/screen/ActivityScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  /*
   * To keep the template simple and small we're adding padding to prevent view
   * from rendering under the System UI.
   * For bigger apps the recommendation is to use `react-native-safe-area-context`:
   * https://github.com/AppAndFlow/react-native-safe-area-context
   *
   * You can read more about it here:
   * https://github.com/react-native-community/discussions-and-proposals/discussions/827
   */
  const safePadding = '5%';

  return (
    <View style={{ flex: 1 }}>
      < RootNavigator />
    </View >
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
