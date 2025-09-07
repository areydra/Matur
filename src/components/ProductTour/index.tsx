import { Image } from 'expo-image';
import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductTourProps } from '../../types';
import OnboardingButton from '../OnboardingButton';
import PageIndicator from '../PageIndicator';
import { styles } from './styles';

const { width } = Dimensions.get('window');

const ProductTour: React.FC<ProductTourProps> = ({ slides, onComplete, onSkip }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const slideIndex = Math.round(scrollPosition / width);
    setCurrentSlide(slideIndex);
  };

  const goToNextSlide = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      scrollViewRef.current?.scrollTo({ x: nextSlide * width, animated: true });
      setCurrentSlide(nextSlide);
    } else {
      // Last slide - navigate to login
      console.log('Navigate to login screen');
      onComplete();
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      const previousSlide = currentSlide - 1;
      scrollViewRef.current?.scrollTo({ x: previousSlide * width, animated: true });
      setCurrentSlide(previousSlide);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>Skip ›</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            {/* Illustration */}
            <Image
              source={slide.illustration}
              style={styles.illustration}
            />
            
            {/* Text Content */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        {/* Page Indicators */}
        
        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {/* Previous Button */}
          {currentSlide > 0 ? (
            <OnboardingButton
              variant="left"
              onPress={goToPreviousSlide}
            />
          ) : (
            <View style={{ width: 56, height: 56 }}/>
          )}
          <PageIndicator currentPage={currentSlide} totalPages={slides.length} />
          {/* Next Button */}
          <OnboardingButton
            variant="right"
            onPress={goToNextSlide}
          />
        </View>
      </View>
      <Image
        source={require('@/assets/images/onboarding/shape.png')}
        style={styles.shape}
      />
    </SafeAreaView>
  );
};

export default ProductTour;