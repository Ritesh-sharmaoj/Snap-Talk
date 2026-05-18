import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import SnapLogo from '../components/SnapLogo';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Signup'), 900);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient colors={[colors.paper, '#EAFBF6']} style={styles.screen}>
      <View style={styles.center}>
        <SnapLogo />
        <Text style={styles.copy}>A clean social space for moments, stories, reels, and real conversations.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  center: {
    alignItems: 'center',
  },
  copy: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 23,
    marginTop: 22,
    maxWidth: 310,
    textAlign: 'center',
  },
});
