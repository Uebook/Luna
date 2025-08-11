import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
// import { useNavigation } from '@react-navigation/native';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  // const navigation = useNavigation();

  return (
    <ImageBackground
      source={require('../assets/backgoundImageLogin.jpg')} // Make sure the path is correct
      style={styles.backgroundImage}
      resizeMode="cover">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>
            Good to see you back! <Text style={{fontSize: 16}}>🖤</Text>
          </Text>

          <View style={styles.content}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, styles.nextButton]}
              onPress={() =>
                navigation.navigate('PasswordTyping', {email: email})
              }
              // disabled={!email}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    // justifyContent: 'center',
    paddingHorizontal: 30,
    marginTop: '60%',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    marginTop: 300,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 20,
    borderColor: '#f5f5f5',
    borderWidth: 0.5,
  },
  button: {
    width: '100%',
    // height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    // marginTop: 100
  },
  nextButton: {
    backgroundColor: '#0055FF',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    paddingVertical: 14,
  },
  cancelText: {
    color: '#202020',
    fontSize: 16,
    fontWeight: '400',
  },
});

export default LoginScreen;
