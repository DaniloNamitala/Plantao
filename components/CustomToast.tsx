import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, Text } from 'react-native';
import Animated, {
    FadeInDown,
    FadeOutDown,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

export type ToastConfig = {
  text: string;
  color?: string;
  icon?: React.ComponentProps<typeof FontAwesome5>['name'];
  duration?: number;
};

type Props = {
  visible: boolean;
  config: ToastConfig;
  onHide: () => void;
};

export default function CustomToast({ visible, config, onHide }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const defaultColor = isDark ? '#e0e0e0' : '#333';
  const bgColor = config.color ?? defaultColor;
  const iconName = config.icon ?? 'comment-alt';

  const progress = useSharedValue(1);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  useEffect(() => {
    if (visible) {
      const ms = config.duration ?? 3000;
      progress.value = 1;
      progress.value = withTiming(0, { duration: ms });

      const timer = setTimeout(onHide, ms);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutDown.duration(250)}
      style={[styles.container, { bottom: 40 + keyboardHeight, backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}
    >
      <FontAwesome5 name={iconName} size={16} color={bgColor} style={styles.icon} />
      <Text style={[styles.text, { color: isDark ? '#e0e0e0' : '#333' }]} numberOfLines={2}>
        {config.text}
      </Text>
      <Animated.View style={[styles.progressBar, { backgroundColor: bgColor }, progressStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    overflow: 'hidden',
    zIndex: 999,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    borderBottomLeftRadius: 14,
  },
});
