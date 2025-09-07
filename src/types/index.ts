export interface OnboardingButtonProps {
  onPress: () => void;
  variant?: 'left' | 'right';
}

export interface PageIndicatorProps {
  currentPage: number;
  totalPages: number;
}

export interface ProductTourSlide {
  id: number;
  title: string;
  description: string;
  illustration: string;
}

export interface ProductTourProps {
  slides: ProductTourSlide[];
  onComplete: () => void;
  onSkip: () => void;
}
