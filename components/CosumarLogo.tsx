import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

interface CosumarLogoProps {
  size?: number;
}

export default function CosumarLogo({ size = 120 }: CosumarLogoProps) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/a7c1q5vrddbll2ukzd5tg' }}
        style={[styles.logo, { width: size, height: size * 0.6 }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 48,
  },
});
