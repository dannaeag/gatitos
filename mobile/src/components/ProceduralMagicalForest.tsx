/**
 * ProceduralMagicalForest
 *
 * Asset classification after visual inspection:
 *
 * SCENE LAYERS (full-screen, meant to tile/fill viewport):
 *   asset_sky.png               1168×2112 – starry sky with moon
 *   asset_background_forest.png 1168×2112 – distant forest + fog
 *   asset_fireflies.png         1168×2112 – glowing particles across scene
 *   asset_foreground_frame.png  1168×2112 – two big trees framing edges
 *   asset_ground.png            1920×1280 – ground path
 *
 * SPRITE ASSETS (individual characters, must be SMALL and positioned):
 *   asset_fairy.png     1168×2112 – fairy character fills ~70% of canvas
 *   asset_owl.png       1168×2112 – owl character fills ~60% of canvas
 *   asset_mushroom.png  1600×1600 – mushroom character centred
 *   asset_lanterns.png  1168×2112 – two lanterns fill ~65% of canvas
 *
 * These sprites are NOT compositing layers. They are individual PNGs
 * with the character taking up most of the canvas. They MUST be placed
 * inside small positioned containers — NOT stretched to fill the screen.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

// ─── Asset registry ───────────────────────────────────────────────────────────
const ASSETS = {
  // Scene layers (fill screen)
  sky:       require('../../assets/fondo/asset_sky.png'),
  forest:    require('../../assets/fondo/asset_background_forest.png'),
  fireflies: require('../../assets/fondo/asset_fireflies.png'),
  frame:     require('../../assets/fondo/asset_foreground_frame.png'),
  ground:    require('../../assets/fondo/asset_ground.png'),
  // Sprite characters (small, positioned)
  fairy:     require('../../assets/fondo/asset_fairy.png'),
  owl:       require('../../assets/fondo/asset_owl.png'),
  mushroom:  require('../../assets/fondo/asset_mushroom.png'),
  lanterns:  require('../../assets/fondo/asset_lanterns.png'),
} as const;

// ─── Sprite placement config ────────────────────────────────────────────────
// All values are % of stageWidth / stageHeight so they scale with screen.
const SPRITES = {
  // Two lanterns hang from the top of the scene
  lanterns: { widthPct: 0.35, aspectRatio: 2112/1168, top: -0.02, left: 0.08, zIndex: 35 },
  // Fairy floats bottom-left, small
  fairy:    { widthPct: 0.18, aspectRatio: 2112/1168, bottom: 0.06, left: 0.02,  zIndex: 60 },
  // Owl perches bottom-right, small
  owl:      { widthPct: 0.18, aspectRatio: 2112/1168, bottom: 0.04, right: 0.02, zIndex: 50 },
  // Mushroom at bottom center-right
  mushroom: { widthPct: 0.14, aspectRatio: 1.0,       bottom: 0.03, right: 0.18, zIndex: 45 },
} as const;

// ─── Animation durations (ms) ────────────────────────────────────────────────
const DUR = {
  skyTwinkle:     2000,
  forestSway:     5000,
  fgWind:         3500,
  lanternA:        800,
  lanternB:        600,
  lanternC:        900,
  fairyY:         2400,
  fairyX:         2800,
  owlBreathe:     1500,
  mushroomPulse:  1800,
  firefliesDrift: 3000,
  firefliesAlpha: 2000,
} as const;

// ─── Component ───────────────────────────────────────────────────────────────
interface Props { children?: React.ReactNode; }

export const ProceduralMagicalForest: React.FC<Props> = ({ children }) => {
  const { width: winW, height: winH } = useWindowDimensions();
  const isWideWeb = Platform.OS === 'web' && winW > 640;
  const stageW = isWideWeb ? Math.min(winW, 500) : winW;
  const stageH = isWideWeb ? Math.min(winH, 900) : winH;

  // ── Animated values ──
  const skyOpacity      = useRef(new Animated.Value(0.85)).current;
  const forestSwayX     = useRef(new Animated.Value(0)).current;
  const fgWindAngle     = useRef(new Animated.Value(0)).current;
  const lanternOpacity  = useRef(new Animated.Value(0.88)).current;
  const fairyY          = useRef(new Animated.Value(0)).current;
  const fairyX          = useRef(new Animated.Value(0)).current;
  const fairyAngle      = useRef(new Animated.Value(0)).current;
  const owlScaleY       = useRef(new Animated.Value(1.0)).current;
  const mushroomScale   = useRef(new Animated.Value(1.0)).current;
  const firefliesY      = useRef(new Animated.Value(0)).current;
  const firefliesAlpha  = useRef(new Animated.Value(0.7)).current;

  const pingPong = useCallback(
    (anim: Animated.Value, from: number, to: number, dur: number, easing = Easing.inOut(Easing.sine)) =>
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: to,   duration: dur, easing, useNativeDriver: true }),
        Animated.timing(anim, { toValue: from, duration: dur, easing, useNativeDriver: true }),
      ])),
    []
  );

  useEffect(() => {
    // Scene layers
    pingPong(skyOpacity,   0.75, 1.0,   DUR.skyTwinkle).start();
    pingPong(forestSwayX,  0,    -8,    DUR.forestSway).start();
    pingPong(fgWindAngle, -1,     1,    DUR.fgWind, Easing.inOut(Easing.ease)).start();

    // Lanterns: 3-step irregular flicker
    Animated.loop(Animated.sequence([
      Animated.timing(lanternOpacity, { toValue: 1.00, duration: DUR.lanternA, easing: Easing.ease, useNativeDriver: true }),
      Animated.timing(lanternOpacity, { toValue: 0.78, duration: DUR.lanternB, easing: Easing.ease, useNativeDriver: true }),
      Animated.timing(lanternOpacity, { toValue: 0.95, duration: DUR.lanternC, easing: Easing.ease, useNativeDriver: true }),
    ])).start();

    // Fairy: sine float + tilt
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(fairyY,     { toValue: -10, duration: DUR.fairyY, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
        Animated.timing(fairyX,     { toValue:   5, duration: DUR.fairyX, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
        Animated.timing(fairyAngle, { toValue:   1, duration: DUR.fairyY, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fairyY,     { toValue: 0, duration: DUR.fairyY, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
        Animated.timing(fairyX,     { toValue: 0, duration: DUR.fairyX, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
        Animated.timing(fairyAngle, { toValue: 0, duration: DUR.fairyY, useNativeDriver: true }),
      ]),
    ])).start();

    // Characters
    pingPong(owlScaleY,     1.0, 1.04, DUR.owlBreathe,   Easing.inOut(Easing.ease)).start();
    pingPong(mushroomScale, 1.0, 1.06, DUR.mushroomPulse, Easing.inOut(Easing.ease)).start();

    // Fireflies
    Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(firefliesY,     { toValue:  10,   duration: DUR.firefliesDrift, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
        Animated.timing(firefliesAlpha, { toValue: 0.95, duration: DUR.firefliesAlpha, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(firefliesY,     { toValue: -5,   duration: DUR.firefliesDrift, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
        Animated.timing(firefliesAlpha, { toValue: 0.60, duration: DUR.firefliesAlpha, useNativeDriver: true }),
      ]),
    ])).start();
  }, []);

  // Interpolations
  const fgRotate    = fgWindAngle.interpolate({ inputRange: [-1, 1], outputRange: ['-0.8deg', '0.8deg'] });
  const fairyRotate = fairyAngle.interpolate({ inputRange: [0, 1],   outputRange: ['-3deg', '3deg'] });

  // Mushroom tap bounce
  const onMushroomTap = useCallback(() => {
    Animated.sequence([
      Animated.timing(mushroomScale, { toValue: 1.25, duration: 150, useNativeDriver: true }),
      Animated.timing(mushroomScale, { toValue: 1.00, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [mushroomScale]);

  // ── Compute sprite positions from config ──
  const lanternW = Math.round(stageW * SPRITES.lanterns.widthPct);
  const lanternH = Math.round(lanternW * SPRITES.lanterns.aspectRatio);
  const fairyW   = Math.round(stageW * SPRITES.fairy.widthPct);
  const fairyH   = Math.round(fairyW * SPRITES.fairy.aspectRatio);
  const owlW     = Math.round(stageW * SPRITES.owl.widthPct);
  const owlH     = Math.round(owlW * SPRITES.owl.aspectRatio);
  const mushW    = Math.round(stageW * SPRITES.mushroom.widthPct);
  const mushH    = Math.round(mushW * SPRITES.mushroom.aspectRatio);

  return (
    <View style={styles.outerWrapper}>
      <View style={[styles.stage, isWideWeb && styles.wideWebStage]}>

        {/* ═══════ SCENE LAYERS (full-screen, back → front) ═══════ */}

        {/* 0. Sky + Moon — twinkle opacity */}
        <Animated.View style={[styles.fullLayer, { opacity: skyOpacity, zIndex: 0 }]}>
          <Image source={ASSETS.sky} style={styles.fillImg} resizeMode="cover" />
        </Animated.View>

        {/* 1. Background Forest — slow parallax sway */}
        <Animated.View style={[styles.fullLayer, { zIndex: 10, transform: [{ translateX: forestSwayX }] }]}>
          <Image source={ASSETS.forest} style={styles.fillImg} resizeMode="cover" />
        </Animated.View>

        {/* 2. Fireflies — drift + opacity pulse */}
        <Animated.View style={[styles.fullLayer, { zIndex: 20, opacity: firefliesAlpha, transform: [{ translateY: firefliesY }] }]}>
          <Image source={ASSETS.fireflies} style={styles.fillImg} resizeMode="cover" />
        </Animated.View>

        {/* 3. Foreground Frame Trees — wind shake */}
        <Animated.View style={[styles.fullLayer, { zIndex: 30, transform: [{ rotate: fgRotate }] }]}>
          <Image source={ASSETS.frame} style={styles.fillImg} resizeMode="cover" />
        </Animated.View>

        {/* ═══════ SPRITE ASSETS (positioned, sized) ═══════ */}

        {/* 4. Lanterns — hang from top, small, flicker */}
        <Animated.View style={[styles.sprite, {
          width: lanternW,
          height: lanternH,
          top: stageH * (SPRITES.lanterns.top ?? 0),
          left: stageW * (SPRITES.lanterns.left ?? 0),
          zIndex: SPRITES.lanterns.zIndex,
          opacity: lanternOpacity,
        }]}>
          <Image source={ASSETS.lanterns} style={styles.fillImg} resizeMode="contain" />
        </Animated.View>

        {/* 5. Ground — bottom of screen */}
        <View style={[styles.fullLayer, { zIndex: 40 }]}>
          <Image source={ASSETS.ground} style={styles.fillImg} resizeMode="cover" />
        </View>

        {/* 6. Mushroom — bottom center-right, tappable pulse */}
        <TouchableOpacity
          style={[styles.sprite, {
            width: mushW,
            height: mushH,
            bottom: stageH * SPRITES.mushroom.bottom!,
            right: stageW * SPRITES.mushroom.right!,
            zIndex: SPRITES.mushroom.zIndex,
          }]}
          activeOpacity={0.9}
          onPress={onMushroomTap}
        >
          <Animated.Image
            source={ASSETS.mushroom}
            style={[styles.fillImg, { transform: [{ scale: mushroomScale }] }]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* 7. Owl — bottom-right corner, breathe */}
        <Animated.View style={[styles.sprite, {
          width: owlW,
          height: owlH,
          bottom: stageH * SPRITES.owl.bottom!,
          right: stageW * SPRITES.owl.right!,
          zIndex: SPRITES.owl.zIndex,
          transform: [{ scaleY: owlScaleY }],
        }]}>
          <Image source={ASSETS.owl} style={styles.fillImg} resizeMode="contain" />
        </Animated.View>

        {/* 8. Fairy — bottom-left corner, float + tilt */}
        <Animated.View style={[styles.sprite, {
          width: fairyW,
          height: fairyH,
          bottom: stageH * SPRITES.fairy.bottom!,
          left: stageW * SPRITES.fairy.left!,
          zIndex: SPRITES.fairy.zIndex,
          transform: [
            { translateY: fairyY },
            { translateX: fairyX },
            { rotate: fairyRotate },
          ],
        }]}>
          <Image source={ASSETS.fairy} style={styles.fillImg} resizeMode="contain" />
        </Animated.View>

        {/* ═══════ UI LAYERS ═══════ */}

        {/* Ambient dark tint for text readability */}
        <View style={styles.ambientOverlay} />

        {/* App screen content */}
        <View style={styles.contentOverlay}>{children}</View>

      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#030810',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  wideWebStage: {
    maxWidth: 500,
    maxHeight: 900,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    // @ts-ignore – web only
    marginVertical: 'auto',
  },
  /** Full-screen absolute layer for scene backgrounds */
  fullLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  /** Positioned container for sprite characters */
  sprite: {
    position: 'absolute',
  },
  /** Fills parent — used for both full layers and sprite containers */
  fillImg: {
    width: '100%',
    height: '100%',
  },
  ambientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 8, 16, 0.15)',
    zIndex: 80,
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});
