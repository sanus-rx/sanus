import { Image } from 'expo-image';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useTheme } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

export default function Onboarding({ onDone }) {
  const { colors } = useTheme(); 

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  activeDot: {
    backgroundColor: colors.onSurfaceVariant,
    width: 10,
    height: 10,
  },
  dot: {
    backgroundColor: colors.onBackground,
    width: 8,
    height: 8,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
  },
   image: {
    width: 320,
    height: 320,
    marginVertical: 30,
  },
});
  const slides = [
    {
      key: 'slide1',
      title: 'Verify Your Medicine. Protect Your Health',
      text: 'Counterfeit medicines are a serious threat. Sanus uses solana blockchain technology to help you easily confirm the authenticity of your medication faster and and more securely than ever before.',
      backgroundColor: colors.background,
      image: require('../../../assets/images/logo.webp'), 
    },
    {
      key: 'slide2',
      title: 'Simple Scan, Instant Peace of Mind',
      text: "Simply scan the unique QR code on your medicine packaging. We'll instantly connect to the Solana blockchain to verify its origin and ensure it hasn't been tampered with or used before.",
      backgroundColor: colors.background,
      image: require('../../../assets/images/4137379.jpg'),
    },
    {
      key: 'slide3',
      title: 'Your Health Safety, Secured by Blockchain.',
      text: 'You\'re all set! Let\'s begin your wellness journey together.',
      backgroundColor: colors.background,
      image: require('../../../assets/images/Pi7_cropper.png'),
    },
    {
      key: 'slide4',
      title: 'Ready to Verify',
      text: "To get started, we'll need access to your camera to scan QR codes. This is essential for verifying your medicine.",
      backgroundColor: colors.background,
      image: require('../../../assets/images/camera.webp'),
    }
  ];

  const renderSlide = ({ item }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
         <Image source={item.image} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  return (
    <AppIntroSlider
      renderItem={renderSlide}
      data={slides}
      onDone={onDone}
      showSkipButton={true}
      onSkip={onDone}
      activeDotStyle={styles.activeDot}
      dotStyle={styles.dot}
      buttonTextStyle={styles.buttonText}
      renderNextButton={() => <Text style={styles.buttonText}>Next</Text>}
      renderDoneButton={() => <Text style={styles.buttonText}>Done</Text>}
      renderSkipButton={() => <Text style={styles.buttonText}>Skip</Text>}
    />
  );
}