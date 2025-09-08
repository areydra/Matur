import ProductTour from '@/src/components/ProductTour';
import { ProductTourSlide } from '@/src/types';
import { router } from 'expo-router';
import React from 'react';

export default function OnboardingRoute() {
  const slides: ProductTourSlide[] = [
    {
      id: 1,
      title: 'Easy chat with your friends',
      description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.',
      illustration: require('@/assets/images/onboarding/slide_one.png'),
    },
    {
      id: 2,
      title: 'Video call with your community',
      description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.',
      illustration: require('@/assets/images/onboarding/slide_two.png'),
    },
    {
      id: 3,
      title: 'Get notified when someone chat you',
      description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.',
      illustration: require('@/assets/images/onboarding/slide_three.png'),
    },
  ];

  const handleComplete = () => {
    router.push('/onboarding/login');
  };

  const handleSkip = () => {
    router.push('/onboarding/login');
  };

  return (
    <ProductTour 
      slides={slides} 
      onComplete={handleComplete} 
      onSkip={handleSkip} 
    />
  );
}