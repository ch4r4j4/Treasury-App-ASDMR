import { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// ✅ CONFIGURACIÓN DE PRODUCCIÓN
// Solo usa TestIds en desarrollo (__DEV__ = true)
// En producción usa las variables de entorno o falla con un warning
const adUnitId = __DEV__ 
  ? TestIds.BANNER  // Anuncios de prueba SOLO en desarrollo
  : Platform.OS === 'ios' 
    ? process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID || ''
    : process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID || '';

// ⚠️ Warning si no hay ID configurado en producción
if (!__DEV__ && !adUnitId) {
  console.warn('⚠️ AdMob Banner ID not configured for production!');
}

export default function AdBanner() {
  const [bannerHeight, setBannerHeight] = useState(50);

  // Si no hay adUnitId configurado, no mostrar nada
  if (!adUnitId) {
    return null;
  }

  return (
    <View 
      style={[styles.container, { height: bannerHeight }]}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        if (height > 0 && height !== bannerHeight) {
          setBannerHeight(height);
        }
      }}
    >
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('✅ Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.log('❌ Banner ad failed to load:', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});