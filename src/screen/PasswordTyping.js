// import {useNavigation} from '@react-navigation/native';
// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
// } from 'react-native';

// const {width, height} = Dimensions.get('window');

// const CORRECT_PASSWORD = '123456';

// const PasswordTyping = ({route}) => {
//   console.log('route', route.params);
//   const {email} = route?.params;
//   const [password, setPassword] = useState('');
//   const [isError, setIsError] = useState(false);
//   const navigation = useNavigation();

//   const handlePasswordChange = text => {
//     if (text.length <= 6) {
//       setPassword(text);

//       if (text.length === 6) {
//         // Simulate password check
//         if (text === CORRECT_PASSWORD) {
//           setIsError(false);
//           navigation.navigate('MainApp'); // ✅ Navigate only when correct
//         } else {
//           setIsError(true);
//         }
//       }
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//       {/* Background Shape */}
//       <Image
//         source={require('../assets/Bubbleotp.png')}
//         style={styles.bgImage}
//       />

//       {/* Avatar */}
//       <View style={styles.avatarWrapper}>
//         <Image
//           source={{
//             uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000',
//           }}
//           style={styles.avatarImage}
//         />
//       </View>

//       {/* Welcome Text */}
//       <Text style={styles.welcomeText}>Hello, Romina!!</Text>
//       <Text style={styles.subText}>Type your password</Text>

//       {/* Hidden Input */}
//       <TextInput
//         value={password}
//         onChangeText={handlePasswordChange}
//         keyboardType="number-pad"
//         secureTextEntry
//         maxLength={6}
//         style={styles.hiddenInput}
//         autoFocus
//       />

//       {/* Dots */}
//       <View style={styles.dotsContainer}>
//         {[0, 1, 2, 3, 4, 5].map(i => (
//           <View
//             key={i}
//             style={[
//               styles.dot,
//               {
//                 backgroundColor: isError
//                   ? '#ff3b30'
//                   : i < password.length
//                   ? '#004CFF'
//                   : '#dfe4ea',
//               },
//             ]}
//           />
//         ))}
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// export default PasswordTyping;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     paddingTop: 60,
//   },
//   bgImage: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: width,
//     height: 350,
//     resizeMode: 'cover',
//   },
//   avatarWrapper: {
//     marginTop: height * 0.22,
//     backgroundColor: '#fff',
//     borderRadius: 60,
//     padding: 4,
//     elevation: 5,
//   },
//   avatarImage: {
//     width: 106,
//     height: 106,
//     borderRadius: 53,
//   },
//   welcomeText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginTop: 20,
//     color: '#2d3436',
//   },
//   subText: {
//     fontSize: 16,
//     color: '#636e72',
//     marginTop: 10,
//   },
//   hiddenInput: {
//     height: 0,
//     width: 0,
//     position: 'absolute',
//     opacity: 0,
//   },
//   dotsContainer: {
//     flexDirection: 'row',
//     marginTop: 30,
//     gap: 12,
//   },
//   dot: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//   },
// });

import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import CustomAlert from '../component/CustomAlert';
import useUserStore from '../store/UserStore';

const {width, height} = Dimensions.get('window');

const PasswordTyping = ({route}) => {
  const {email} = route?.params;
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const navigation = useNavigation();

  console.log(email);

  const showAlert = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // const handleLogin = async pass => {
  //   try {
  //     const formData = new FormData();
  //     formData.append('email', email);
  //     formData.append('password', pass);

  //     const response = await axios.post(
  //       'https://argosmob.uk/luna/public/api/v1/auth/login',
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       },
  //     );

  //     console.log('response', response);

  //     // ✅ If login success
  //     showAlert('success', 'Login successful!');
  //     setTimeout(() => {
  //       setAlertVisible(false);
  //       navigation.navigate('MainApp');
  //     }, 500);
  //   } catch (error) {
  //     console.error('Login error:', error?.response?.data || error.message);
  //     showAlert('error', error?.response?.data?.message || 'Login failed');
  //   }
  // };

  const handleLogin = async pass => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', pass);

      const response = await axios.post(
        'https://argosmob.uk/luna/public/api/v1/auth/login',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('response', response);

      if (response.data.status === true) {
        // ✅ If login success
        showAlert('success', 'Login successful!');

        // Store user data in Zustand
        useUserStore.getState().setUser(response.data.data); // Assuming user data is in response.data.data

        setTimeout(() => {
          setAlertVisible(false);
          navigation.navigate('MainApp');
        }, 500);
      } else {
        // Handle API success=false case
        const errorMsg = response.data.message || 'Login failed';
        console.error('Login failed:', errorMsg);
        showAlert('error', errorMsg);
      }
    } catch (error) {
      console.error('Login error:', error?.response?.data || error.message);
      showAlert('error', error?.response?.data?.message || 'Login failed');
    }
  };

  const handlePasswordChange = text => {
    if (text.length <= 6) {
      setPassword(text);

      if (text.length === 6) {
        // ✅ 8 chars because your API password is 12345678
        handleLogin(text);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Background Shape */}
      <Image
        source={require('../assets/Bubbleotp.png')}
        style={styles.bgImage}
      />

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000',
          }}
          style={styles.avatarImage}
        />
      </View>

      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Hello!!</Text>
      <Text style={styles.subText}>Type your password</Text>

      {/* Hidden Input */}
      <TextInput
        value={password}
        onChangeText={handlePasswordChange}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        style={styles.hiddenInput}
        autoFocus
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: isError
                  ? '#ff3b30'
                  : i < password.length
                  ? '#004CFF'
                  : '#dfe4ea',
              },
            ]}
          />
        ))}
      </View>
      <TouchableOpacity
        style={{marginTop: 20}}
        onPress={() => {
          navigation.navigate('PasswordRecoveryScreen');
        }}>
        <Text style={styles.subText}>Forget your password?</Text>
      </TouchableOpacity>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        type={alertType}
        message={alertMessage}
        onPress={() => setAlertVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default PasswordTyping;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: 350,
    resizeMode: 'cover',
  },
  avatarWrapper: {
    marginTop: height * 0.22,
    backgroundColor: '#fff',
    borderRadius: 60,
    padding: 4,
    elevation: 5,
  },
  avatarImage: {
    width: 106,
    height: 106,
    borderRadius: 53,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#2d3436',
  },
  subText: {
    fontSize: 16,
    color: '#636e72',
    marginTop: 10,
  },
  hiddenInput: {
    height: 0,
    width: 0,
    position: 'absolute',
    opacity: 0,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 12,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
