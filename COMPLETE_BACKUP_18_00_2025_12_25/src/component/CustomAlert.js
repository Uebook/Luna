// components/CustomAlert.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const CustomAlert = ({ visible, type = 'success', message, onPress }) => {
  const getIconDetails = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: 'green' };
      case 'error':
        return { name: 'x-circle', color: 'red' };
      default:
        return { name: 'info', color: '#333' };
    }
  };

  const { name, color } = getIconDetails();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          {/* Icon */}
          <Icon name={name} size={48} color={color} style={{ marginBottom: 12 }} />

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#000', // black button like in your image
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomAlert;
