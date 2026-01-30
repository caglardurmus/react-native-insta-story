import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  Extrapolation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  cancelAnimation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

const getPERSPECTIVE = () => (Platform.OS === 'ios' ? 2.38 : 2.2);
const getTR_POSITION = () => (Platform.OS === 'ios' ? 2 : 1.4);
const getDefaultResponderCaptureDx = () =>
  Platform.OS === 'android' ? 20 : 60;

export interface CubeNavigationHorizontalProps {
  children: React.ReactNode[];
  callBackAfterSwipe?: (page: number | string) => void;
  callbackOnSwipe?: (isSwiping: boolean) => void;
  scrollLockPage?: number;
  responderCaptureDx?: number;
  expandView?: boolean;
  loop?: boolean;
}

export interface CubeNavigationHorizontalRef {
  scrollTo: (page: number, animated?: boolean) => void;
}

const closest = (num: number, pages: number[]): number => {
  let minDiff = 1000;
  let ans = 0;
  for (let i = 0; i < pages.length; i++) {
    const m = Math.abs(num - pages[i]);
    if (m < minDiff) {
      minDiff = m;
      ans = i;
    }
  }
  return ans;
};

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 120,
};

function AnimatedCubePage({
  index,
  scrollX,
  width: w,
  fullWidth,
  loop,
  expandStyle,
  child,
  isActive,
}: {
  index: number;
  scrollX: Animated.SharedValue<number>;
  width: number;
  fullWidth: number;
  loop: boolean;
  expandStyle: object;
  child: React.ReactElement;
  isActive: boolean;
}) {
  const TR = getTR_POSITION();
  const PERSP = getPERSPECTIVE();
  const pageX = -w * index;
  const loopVar = (variable: number, sign: number) =>
    variable + Math.sign(sign) * (fullWidth + w);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const scroll = scrollX.value;

    const padInput = (vars: number[]): number[] => {
      if (!loop) return vars;
      return [
        ...vars.map((v) => loopVar(v, -1)),
        ...vars,
        ...vars.map((v) => loopVar(v, 1)),
      ];
    };
    const padOutput = <T,>(vars: T[]): T[] => {
      if (!loop) return vars;
      return [...vars, ...vars, ...vars];
    };

    const inputRange = padInput([pageX - w, pageX, pageX + w]);
    const outputTranslate = padOutput([
      (-w - 1) / TR,
      0,
      (w + 1) / TR,
    ]) as number[];
    const translateX = interpolate(
      scroll,
      inputRange,
      outputTranslate,
      Extrapolation.CLAMP
    );

    const outputRotate = padOutput([-60, 0, 60]) as number[];
    const rotateYDeg = interpolate(
      scroll,
      inputRange,
      outputRotate,
      Extrapolation.CLAMP
    );
    const rotateY = `${rotateYDeg}deg`;

    const inputRangeAfter = padInput([
      pageX - w,
      pageX - w + 0.1,
      pageX,
      pageX + w - 0.1,
      pageX + w,
    ]);
    const outputTranslateAfter = padOutput([
      -w - 1,
      (-w - 1) / PERSP,
      0,
      (w + 1) / PERSP,
      w + 1,
    ]) as number[];
    const translateXAfterRotate = interpolate(
      scroll,
      inputRangeAfter,
      outputTranslateAfter,
      Extrapolation.CLAMP
    );

    const inputRangeOpacity = padInput([
      pageX - w,
      pageX - w + 10,
      pageX,
      pageX + w - 250,
      pageX + w,
    ]);
    const outputOpacity = padOutput([0, 0.6, 1, 0.6, 0]) as number[];
    const opacity = interpolate(
      scroll,
      inputRangeOpacity,
      outputOpacity,
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { perspective: w },
        { translateX },
        { rotateY },
        { translateX: translateXAfterRotate },
      ],
      opacity,
    };
  });

  const childStyle = (child.props as { style?: unknown }).style;
  const style = [childStyle, expandStyle].filter(Boolean);
  const element = React.cloneElement(child, { style } as Record<
    string,
    unknown
  >);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: 'transparent' },
        animatedStyle,
      ]}
      pointerEvents={isActive ? 'auto' : 'none'}
    >
      {element}
    </Animated.View>
  );
}

const CubeNavigationHorizontal = forwardRef<
  CubeNavigationHorizontalRef,
  CubeNavigationHorizontalProps
>(function CubeNavigationHorizontal(
  {
    children,
    callBackAfterSwipe,
    callbackOnSwipe,
    scrollLockPage,
    responderCaptureDx: responderCaptureDxProp,
    expandView,
    loop,
  },
  ref
) {
  const childrenArray = React.Children.toArray(children);
  const pages = childrenArray.map((_, index) => width * -index);
  const fullWidth = (childrenArray.length - 1) * width;

  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  const scrollX = useSharedValue(0);
  const startX = useSharedValue(0);

  const [currentPage, setCurrentPage] = useState(0);

  const callBackAfterSwipeRef = useRef(callBackAfterSwipe);
  const callbackOnSwipeRef = useRef(callbackOnSwipe);
  callBackAfterSwipeRef.current = callBackAfterSwipe;
  callbackOnSwipeRef.current = callbackOnSwipe;

  useEffect(() => {
    if (
      scrollLockPage != null &&
      scrollLockPage >= 0 &&
      scrollLockPage < pages.length
    ) {
      scrollX.value = pages[scrollLockPage];
    }
  }, [scrollLockPage, pages, scrollX]);

  const onSpringEnd = useCallback((page: number) => {
    setCurrentPage(page);
    callBackAfterSwipeRef.current?.(page);
  }, []);

  const finishGesture = useCallback(
    (x: number, velocityX: number) => {
      if (callbackOnSwipeRef.current) {
        callbackOnSwipeRef.current(false);
      }
      const mod = velocityX > 0 ? 100 : -100;
      const currentPages = pagesRef.current;
      const nextPage = closest(x + mod, currentPages);
      const goTo = currentPages[nextPage];
      scrollX.value = withSpring(goTo, SPRING_CONFIG, (finished?: boolean) => {
        if (finished === true) {
          runOnJS(onSpringEnd)(nextPage);
        }
      });
    },
    [scrollX, onSpringEnd]
  );

  const scrollTo = useCallback(
    (page: number, animated: boolean = true) => {
      const toValue = pages[page];
      if (animated) {
        scrollX.value = withSpring(toValue, SPRING_CONFIG);
      } else {
        scrollX.value = toValue;
      }
      setCurrentPage(page);
    },
    [pages, scrollX]
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollTo,
    }),
    [scrollTo]
  );

  const responderCaptureDx =
    responderCaptureDxProp ?? getDefaultResponderCaptureDx();

  const panGesture = Gesture.Pan()
    .activeOffsetX([-responderCaptureDx, responderCaptureDx])
    .onStart((_e: { translationX: number }) => {
      cancelAnimation(scrollX);
      startX.value = scrollX.value;
      if (callbackOnSwipeRef.current) {
        runOnJS(callbackOnSwipeRef.current)(true);
      }
    })
    .onUpdate((e: { translationX: number }) => {
      let newX = startX.value + e.translationX;
      if (loop) {
        const wrap = fullWidth + width;
        if (newX < -wrap) {
          startX.value += wrap;
          newX = startX.value + e.translationX;
        } else if (newX > width) {
          startX.value -= wrap;
          newX = startX.value + e.translationX;
        }
      } else {
        newX = Math.max(-fullWidth, Math.min(0, newX));
      }
      scrollX.value = newX;
    })
    .onEnd((e: { velocityX: number }) => {
      const x = scrollX.value;
      runOnJS(finishGesture)(x, e.velocityX);
    });

  const expandStyle = expandView
    ? { paddingTop: 100, paddingBottom: 100, height: height + 200 }
    : { width, height };

  const containerExpandStyle = expandView
    ? { top: -100, left: 0, width, height: height + 200 }
    : { width, height };

  const containerStyle =
    Platform.OS === 'android' ? styles.flex : styles.absolute;

  return (
    <GestureDetector gesture={panGesture}>
      <View style={containerStyle}>
        <Animated.View style={[styles.blackFullScreen, containerExpandStyle]}>
          {childrenArray.map((child, i) => (
            <AnimatedCubePage
              key={`child-${i}`}
              index={i}
              scrollX={scrollX}
              width={width}
              fullWidth={fullWidth}
              loop={!!loop}
              expandStyle={expandStyle}
              child={child as React.ReactElement}
              isActive={currentPage === i}
            />
          ))}
        </Animated.View>
      </View>
    </GestureDetector>
  );
});

CubeNavigationHorizontal.displayName = 'CubeNavigationHorizontal';

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
  },
  flex: {
    flex: 1,
  },
  blackFullScreen: {
    backgroundColor: '#000',
    position: 'absolute',
    width,
    height,
  },
});

export default CubeNavigationHorizontal;
