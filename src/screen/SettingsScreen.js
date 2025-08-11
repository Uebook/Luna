import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const SettingItem = ({label, value, onPress, isDanger}) => (
  <TouchableOpacity onPress={onPress} style={styles.settingItem}>
    <Text style={[styles.label, isDanger && styles.danger]}>{label}</Text>
    {value ? <Text style={styles.value}>{value}</Text> : null}
    {!isDanger && <Icon name="chevron-right" size={18} color="#999" />}
  </TouchableOpacity>
);

const SettingsScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.sectionHeader}>Personal</Text>
        <SettingItem
          label="Profile"
          onPress={() => navigation.navigate('SettingsProfileScreen')}
        />
        <SettingItem
          label="Profile2"
          onPress={() => navigation.navigate('ProfileScreen')}
        />

        <SettingItem
          label="Shipping Address"
          onPress={() => navigation.navigate('ShippingAddressScreen')}
        />
        <SettingItem
          label="History"
          onPress={() => {
            navigation.navigate('HistoryScreen');
          }}
        />
        <SettingItem
          label="VoucherScreen"
          onPress={() => {
            navigation.navigate('VoucherScreen');
          }}
        />

        <SettingItem
          label="Customer Care"
          onPress={() => {
            navigation.navigate('ChatBotModal');
          }}
        />

        <SettingItem label="Payment methods" onPress={() => {}} />

        <Text style={styles.sectionHeader}>Shop</Text>
        <SettingItem
          label="Country"
          value="Vietnam"
          onPress={() => {
            navigation.navigate('ChooseCountryScreen');
          }}
        />
        <SettingItem
          label="Currency"
          value="$ USD"
          onPress={() => {
            navigation.navigate('ChooseCurrencyScreen');
          }}
        />
        <SettingItem
          label="Sizes"
          value="UK"
          onPress={() => {
            navigation.navigate('ChooseSizeScreen');
          }}
        />
        <SettingItem
          label="Terms and Conditions"
          onPress={() => {
            navigation.navigate('TermsAndConditionsScreen');
          }}
        />

        <Text style={styles.sectionHeader}>Account</Text>
        <SettingItem
          label="Language"
          value="English"
          onPress={() => {
            navigation.navigate('ChooseLanguageScreen');
          }}
        />
        <SettingItem
          label="About Slada"
          onPress={() => {
            navigation.navigate('AboutScreen');
          }}
        />

        <SettingItem label="Logout" onPress={() => {}} isDanger />

        <SettingItem label="Delete My Account" onPress={() => {}} isDanger />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Slada</Text>
          <Text style={styles.footerVersion}>Version 1.0 April, 2020</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
    color: '#000',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  value: {
    marginRight: 8,
    color: '#555',
    fontSize: 14,
  },
  danger: {
    color: 'red',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  footerVersion: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default SettingsScreen;
