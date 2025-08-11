// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     StyleSheet,
//     ImageBackground,
// } from 'react-native';
// import CountryPicker from 'react-native-country-picker-modal';
// import Icon from 'react-native-vector-icons/Feather';

// const CreateAccountScreen = () => {
//     const [countryCode, setCountryCode] = useState('GB');
//     const [withCountryNameButton] = useState(false);
//     const [withFlag] = useState(true);
//     const [showPassword, setShowPassword] = useState(false);

//     return (
//         <ImageBackground
//             source={require('../assets/backgoundImageLogin.jpg')} // 🔁 Replace with your image path
//             style={styles.background}
//         // resizeMode="cover"
//         >
//             <View style={styles.container}>
//                 <Text style={styles.title}>Create{'\n'}Account</Text>

//                 <TouchableOpacity style={styles.avatarCircle}>
//                     <Icon name="camera" size={24} color="#004CFF" />
//                 </TouchableOpacity>

//                 <TextInput
//                     placeholder="Email"
//                     style={styles.inputBox}
//                     placeholderTextColor="#999"
//                 />

//                 <View style={styles.inputRow}>
//                     <TextInput
//                         placeholder="Password"
//                         style={[styles.input, { flex: 1 }]}

//                         placeholderTextColor="#999"
//                     />
//                     <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
//                         <Icon
//                             name={showPassword ? 'eye' : 'eye-off'}
//                             size={20}
//                             color="#999"
//                             style={styles.eyeIcon}
//                         />
//                     </TouchableOpacity>
//                 </View>

//                 <View style={styles.inputRow}>
//                     <CountryPicker
//                         {...{
//                             countryCode,
//                             withFlag,
//                             withCountryNameButton,
//                             withFilter: true,
//                             onSelect: country => setCountryCode(country.cca2),
//                         }}
//                         containerButtonStyle={{ marginRight: 8 }}
//                     />
//                     <TextInput
//                         placeholder="Your number"
//                         style={[styles.input, {
//                             flex: 1,
//                             borderLeftWidth: 1,
//                             borderColor: '#ccc',
//                             paddingLeft: 12
//                         }]}
//                         placeholderTextColor="#999"
//                         keyboardType="phone-pad"
//                     />
//                 </View>

//                 <View style={styles.bottomActions}>
//                     <TouchableOpacity style={styles.doneButton}>
//                         <Text style={styles.doneText}>Done</Text>
//                     </TouchableOpacity>
//                     <Text style={styles.cancelText}>Cancel</Text>
//                 </View>
//             </View>
//         </ImageBackground>
//     );
// };

// const styles = StyleSheet.create({
//     background: {
//         flex: 1,
//         width: '100%',
//         height: '100%',
//     },
//     container: {
//         flex: 1,
//         padding: 24,
//         paddingTop: 80,
//         backgroundColor: 'transparent', // or remove this line entirely
//     },
//     title: {
//         fontSize: 32,
//         fontWeight: 'bold',
//         marginBottom: 32,
//         color: '#000',
//     },
//     avatarCircle: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         borderStyle: 'dashed',
//         borderWidth: 2,
//         borderColor: '#004CFF',
//         justifyContent: 'center',
//         alignItems: 'center',
//         alignSelf: 'flex-start',
//         marginBottom: 32,
//     },
//     inputBox: {
//         backgroundColor: '#f5f5f5',
//         borderRadius: 30,
//         paddingHorizontal: 20,
//         fontSize: 16,
//         height: 55,
//         marginBottom: 16,
//         borderColor:'#F8F8F8',
//         borderWidth:0.5
//     },
//     inputRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#f5f5f5',
//         borderRadius: 30,
//         paddingHorizontal: 16,
//         height: 55,
//         marginBottom: 16,
//     },
//     input: {
//         fontSize: 16,
//     },
//     eyeIcon: {
//         marginLeft: 12,
//     },
//     doneButton: {
//         backgroundColor: '#004CFF',
//         paddingVertical: 16,
//         borderRadius: 30,
//         alignItems: 'center',
//         marginTop: 16,
//         height: 60
//     },
//     doneText: {
//         color: '#fff',
//         fontSize: 18,
//     },
//     cancelText: {
//         textAlign: 'center',
//         marginTop: 12,
//         fontSize: 16,
//         color: '#000',
//         height: 60
//     },
//     bottomActions: {
//         marginTop: 'auto',
//         paddingBottom: 24,
//     },
// });

// export default CreateAccountScreen;


import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import Icon from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import useUserStore from '../store/UserStore';
import { useNavigation } from '@react-navigation/native';
import CustomAlert from '../component/CustomAlert';

const CreateAccountScreen = () => {
  const navigation = useNavigation();

  const [countryCode, setCountryCode] = useState('GB');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success'); // 'success' | 'error'
  const [alertMessage, setAlertMessage] = useState('');

  const setUser = useUserStore(state => state.setUser);

  const requestGalleryPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const res = await PermissionsAndroid.request(
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Photo Permission',
          message:
            'App needs access to your media library to set your profile picture.',
          buttonPositive: 'OK',
        },
      );
      return res === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  const selectImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      setAlertType('error');
      setAlertMessage('Allow media access to choose a profile image.');
      setShowAlert(true);
      return;
    }
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
      });
      setProfileImage(image);
    } catch (error) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        setAlertType('error');
        setAlertMessage('Could not select image.');
        setShowAlert(true);
      }
    }
  };

  const handleRegister = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedPhone) {
      setAlertType('error');
      setAlertMessage('Please fill all fields.');
      setShowAlert(true);
      return;
    }
    if (trimmedPassword.length < 6) {
      setAlertType('error');
      setAlertMessage('Password must be at least 6 characters.');
      setShowAlert(true);
      return;
    }
    if (!profileImage) {
      setAlertType('error');
      setAlertMessage('Please select a profile image.');
      setShowAlert(true);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('email', trimmedEmail);
    formData.append('phone', trimmedPhone);
    formData.append('password', trimmedPassword);
    formData.append('profile', {
      uri: profileImage.path,
      type: profileImage.mime || 'image/jpeg',
      name: profileImage.filename || `profile_${Date.now()}.jpg`,
    });

    try {
      const response = await axios.post(
        'https://argosmob.uk/luna/public/api/v1/auth/register',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 10000,
        },
      );

      if (response.data?.status && response.data?.user) {
        setUser(response.data.user);
        setAlertType('success');
        setAlertMessage('Account created successfully!');
        setShowAlert(true);
      } else {
        setAlertType('error');
        setAlertMessage(response.data?.message || 'An error occurred.');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAlertType('error');
      setAlertMessage(error?.response?.data?.message || 'Network error.');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/backgoundImageLogin.jpg')}
      style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Create{'\n'}Account</Text>

        <TouchableOpacity style={styles.avatarCircle} onPress={selectImage}>
          {profileImage ? (
            <Image
              source={{ uri: profileImage.path }}
              style={{ width: 76, height: 76, borderRadius: 38 }}
            />
          ) : (
            <Icon name="camera" size={24} color="#004CFF" />
          )}
        </TouchableOpacity>

        <TextInput
          placeholder="Email"
          style={styles.inputBox}
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Password"
            style={[styles.input, { flex: 1 }]}
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            maxLength={6}
          />
          <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
            <Icon
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color="#999"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <CountryPicker
            countryCode={countryCode}
            withFlag
            withFilter
            onSelect={country => setCountryCode(country.cca2)}
            containerButtonStyle={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Your number"
            style={[
              styles.input,
              {
                flex: 1,
                borderLeftWidth: 1,
                borderColor: '#ccc',
                paddingLeft: 12,
              },
            ]}
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleRegister}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.doneText}>Done</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Alert */}
        <CustomAlert
          visible={showAlert}
          type={alertType}
          message={alertMessage}
          onPress={() => {
            setShowAlert(false);
            if (alertType === 'success') {
              navigation.replace('MainApp');
            }
          }}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#000',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#004CFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 32,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  inputBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 30,
    paddingHorizontal: 20,
    fontSize: 16,
    height: 55,
    marginBottom: 16,
    borderColor: '#F8F8F8',
    borderWidth: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 55,
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
  },
  eyeIcon: {
    marginLeft: 12,
  },
  doneButton: {
    backgroundColor: '#004CFF',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 16,
    height: 60,
  },
  doneText: {
    color: '#fff',
    fontSize: 18,
  },
  cancelText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    color: '#000',
    height: 60,
  },
  bottomActions: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
});

export default CreateAccountScreen;
