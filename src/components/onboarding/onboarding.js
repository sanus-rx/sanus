import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/color';

const { width, height } = Dimensions.get('window');

export default function Onboarding({ onDone }) {
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides = [
    {
      key: 'slide1',
      title: 'Verify Your Medicine, Protect Your Health',
      text: 'Counterfeit medicines are a serious threat. Sanus uses solana blockchain technology to help you easily confirm the authenticity of your medication faster and more securely than ever before.',
      backgroundColor: Colors.dark.background,
      image: require('../../../assets/images/logo_alt.webp'),
    },
    {
      key: 'slide2',
      title: 'Simple Scan, Instant Peace of Mind',
      text: "Simply scan the unique QR code on your medicine packaging. We'll instantly connect to the Solana blockchain to verify its origin and ensure it hasn't been tampered with or used before.",
      backgroundColor: Colors.dark.background,
      image: require('../../../assets/images/4137379.jpg'),
    },
    {
      key: 'slide3',
      title: 'Your Health Safety, Secured by Blockchain.',
      text: "You're all set! Let's begin your wellness journey together.",
      backgroundColor: Colors.dark.background,
      image: require('../../../assets/images/Pi7_cropper.png'),
    },
    {
      key: 'slide4',
      title: 'Ready to Verify',
      text: "To get started, we'll need access to your camera to scan QR codes. This is essential for verifying your medicine.",
      backgroundColor: Colors.dark.background,
      image: require('../../../assets/images/camera.webp'),
    },
  ];

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      onDone();
    }
  };

  const handleSkip = () => {
    onDone();
  };

  const renderSlide = (item, index) => {
    return (
      <View key={item.key} style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot,
            ]}
            onPress={() => goToSlide(index)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>

      {renderDots()}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? 'Done' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 50,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 320,
    height: 320,
    marginVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark['muted-foreground'],
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: Colors.dark['muted-foreground'],
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: Colors.dark.primary,
    width: 10,
    height: 10,
  },
  inactiveDot: {
    backgroundColor: Colors.dark['muted-foreground'],
    width: 8,
    height: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    color: Colors.dark.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    padding: 10,
  },
  nextButtonText: {
    color: Colors.dark.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});