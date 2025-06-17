import React, { useState } from 'react';
import {
  useColorScheme,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Dimensions,
  View
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './style/style_index';
import { SignInWithGoogle } from './Login';

function LoginPage() {
  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();

  // ✅ Updated: Replaced Colors with direct color values
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
  };

  // Determine if the device is small (e.g., older phones)
  const { height: screenHeight } = Dimensions.get('window');
  const isSmallDevice = screenHeight <= 640;

  const handleSignIn = async () => {
    try {
      const signInSuccess = await SignInWithGoogle();
        console.log('SignInWithGoogle type:', typeof SignInWithGoogle);

      if (signInSuccess) {
        navigation.replace('HomeScreen');
      }
    } catch (error) {
      console.error('❌ Sign-in failed:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <TouchableOpacity onPress={handleSignIn}>
        <Image
          source={require('../assets/images/btn_google_signin_dark_normal_web.png')}
          style={[
            styles.logo2,
            isSmallDevice && { marginBottom: 20 }
          ]}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default LoginPage;
