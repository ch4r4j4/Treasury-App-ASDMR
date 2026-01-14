import { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// IDs de prueba (cambiar a reales en producción)
const adUnitId = __DEV__ 
  ? TestIds.BANNER  // ID de prueba en desarrollo
  : Platform.OS === 'ios' 
    ? process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID || TestIds.BANNER
    : process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID || TestIds.BANNER;

export default function AdBanner() {
  const [bannerHeight, setBannerHeight] = useState(50);

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