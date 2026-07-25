import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, Easing } from 'react-native';

interface AnimatedCatSpriteProps {
  size?: number;
  intervalMs?: number;
}

const FRAMES = [
  require('../../assets/anim_frame1.jpg'),
  require('../../assets/anim_frame2.jpg'),
  require('../../assets/anim_frame3.jpg'),
];

export const AnimatedCatSprite: React.FC<AnimatedCatSpriteProps> = ({
  size = 120,
  intervalMs = 250,
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  // Micro-bounce scale animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Cycle through animation frames continuously
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFrameIndex((prevIndex) => (prevIndex + 1) % FRAMES.length);

      // Trigger slight pulse scale effect on frame change
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spriteWrapper,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={FRAMES[currentFrameIndex]}
          style={styles.spriteImage}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spriteWrapper: {
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#38BDF8',
    backgroundColor: '#1E293B',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  spriteImage: {
    width: '100%',
    height: '100%',
  },
});
