import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  Platform,
  StyleSheet,
} from 'react-native';

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
  const fullWidthRef = useRef(fullWidth);
  pagesRef.current = pages;
  fullWidthRef.current = fullWidth;

  const animatedValue = useMemo(() => {
    const v = new Animated.ValueXY();
    v.setValue({ x: 0, y: 0 });
    return v;
  }, []);
  const valueRef = useRef({ x: 0, y: 0 });

  const [currentPage, setCurrentPage] = useState(0);
  const [_scrollLockPageState, setScrollLockPageState] = useState<
    number | undefined
  >(scrollLockPage != null ? pages[scrollLockPage] : undefined);
  const [, setPanHandlersReady] = useState(false);

  const callBackAfterSwipeRef = useRef(callBackAfterSwipe);
  const callbackOnSwipeRef = useRef(callbackOnSwipe);
  callBackAfterSwipeRef.current = callBackAfterSwipe;
  callbackOnSwipeRef.current = callbackOnSwipe;

  const panResponderRef = useRef<ReturnType<typeof PanResponder.create> | null>(
    null
  );

  useEffect(() => {
    const listener = animatedValue.addListener(
      (value: { x: number; y: number }) => {
        valueRef.current = value;
      }
    );
    return () => animatedValue.removeListener(listener);
  }, [animatedValue]);

  useEffect(() => {
    const responderCaptureDx =
      responderCaptureDxProp ?? getDefaultResponderCaptureDx();

    const onDoneSwiping = (gestureState: PanResponderGestureState) => {
      if (callbackOnSwipeRef.current) {
        callbackOnSwipeRef.current(false);
      }
      const mod = gestureState.dx > 0 ? 100 : -100;
      const currentPages = pagesRef.current;
      const nextPage = closest(valueRef.current.x + mod, currentPages);
      const goTo = currentPages[nextPage];
      (
        animatedValue as Animated.ValueXY & {
          flattenOffset(v: { x: number; y: number }): void;
        }
      ).flattenOffset({
        x: valueRef.current.x,
        y: valueRef.current.y,
      });
      Animated.spring(animatedValue, {
        toValue: { x: goTo, y: 0 },
        friction: 5,
        tension: 0.6,
        useNativeDriver: false,
      }).start();
      setTimeout(() => {
        setCurrentPage(nextPage);
        if (callBackAfterSwipeRef.current) {
          callBackAfterSwipeRef.current(nextPage);
        }
      }, 500);
    };

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => Math.abs(gestureState.dx) > responderCaptureDx,
      onPanResponderGrant: () => {
        if (callbackOnSwipeRef.current) {
          callbackOnSwipeRef.current(true);
        }
        animatedValue.stopAnimation();
        (
          animatedValue as Animated.ValueXY & {
            setOffset(v: { x: number; y: number }): void;
          }
        ).setOffset({
          x: valueRef.current.x,
          y: valueRef.current.y,
        });
      },
      onPanResponderMove: (
        e: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        if (loop) {
          const currentFullWidth = fullWidthRef.current;
          if (gestureState.dx < 0 && valueRef.current.x < -currentFullWidth) {
            (
              animatedValue as Animated.ValueXY & {
                setOffset(v: { x: number; y: number }): void;
              }
            ).setOffset({ x: width, y: 0 });
          } else if (gestureState.dx > 0 && valueRef.current.x > 0) {
            (
              animatedValue as Animated.ValueXY & {
                setOffset(v: { x: number; y: number }): void;
              }
            ).setOffset({
              x: -(currentFullWidth + width),
              y: 0,
            });
          }
        }
        Animated.event([null, { dx: animatedValue.x }], {
          useNativeDriver: false,
        })(e, gestureState);
      },
      onPanResponderRelease: (
        _e: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        onDoneSwiping(gestureState);
      },
      onPanResponderTerminate: (
        _e: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        onDoneSwiping(gestureState);
      },
    });

    panResponderRef.current = panResponder;
    setPanHandlersReady(true);
  }, [animatedValue, loop, responderCaptureDxProp]);

  useEffect(() => {
    if (
      scrollLockPage != null &&
      scrollLockPage >= 0 &&
      scrollLockPage < pages.length
    ) {
      setScrollLockPageState(pages[scrollLockPage]);
    }
  }, [scrollLockPage, pages]);

  const scrollTo = useCallback(
    (page: number, animated: boolean = true) => {
      if (animated) {
        Animated.spring(animatedValue, {
          toValue: { x: pages[page], y: 0 },
          friction: 5,
          tension: 0.6,
          useNativeDriver: false,
        }).start();
      } else {
        animatedValue.setValue({ x: pages[page], y: 0 });
      }
      setCurrentPage(page);
    },
    [animatedValue, pages]
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollTo,
    }),
    [scrollTo]
  );

  const getTransformsFor = useCallback(
    (i: number) => {
      const scrollX = animatedValue.x;
      const pageX = -width * i;
      const loopVariable = (variable: number, sign: number = 1): number =>
        variable + Math.sign(sign) * (fullWidth + width);
      const padInput = (variables: number[]): number[] => {
        if (!loop) return variables;
        const returnedVariables = [...variables];
        returnedVariables.unshift(
          ...variables.map((variable) => loopVariable(variable, -1))
        );
        returnedVariables.push(
          ...variables.map((variable) => loopVariable(variable, 1))
        );
        return returnedVariables;
      };
      const padOutput = <T,>(variables: T[]): T[] => {
        if (!loop) return variables;
        const returnedVariables = [...variables];
        returnedVariables.unshift(...variables);
        returnedVariables.push(...variables);
        return returnedVariables;
      };

      const translateX = scrollX.interpolate({
        inputRange: padInput([pageX - width, pageX, pageX + width]),
        outputRange: padOutput([
          (-width - 1) / getTR_POSITION(),
          0,
          (width + 1) / getTR_POSITION(),
        ]),
        extrapolate: 'clamp',
      });

      const rotateY = scrollX.interpolate({
        inputRange: padInput([pageX - width, pageX, pageX + width]),
        outputRange: padOutput(['-60deg', '0deg', '60deg']),
        extrapolate: 'clamp',
      });

      const translateXAfterRotate = scrollX.interpolate({
        inputRange: padInput([
          pageX - width,
          pageX - width + 0.1,
          pageX,
          pageX + width - 0.1,
          pageX + width,
        ]),
        outputRange: padOutput([
          -width - 1,
          (-width - 1) / getPERSPECTIVE(),
          0,
          (width + 1) / getPERSPECTIVE(),
          width + 1,
        ]),
        extrapolate: 'clamp',
      });

      const opacity = scrollX.interpolate({
        inputRange: padInput([
          pageX - width,
          pageX - width + 10,
          pageX,
          pageX + width - 250,
          pageX + width,
        ]),
        outputRange: padOutput([0, 0.6, 1, 0.6, 0]),
        extrapolate: 'clamp',
      });

      return {
        transform: [
          { perspective: width },
          { translateX },
          { rotateY },
          { translateX: translateXAfterRotate },
        ],
        opacity,
      };
    },
    [animatedValue, fullWidth, loop]
  );

  const renderChild = useCallback(
    (child: React.ReactElement<{ style?: unknown }>, i: number) => {
      const expandStyle = expandView
        ? { paddingTop: 100, paddingBottom: 100, height: height + 200 }
        : { width, height };
      const style = [child.props.style, expandStyle].filter(Boolean);
      const element = React.cloneElement(child, { i, style } as Record<
        string,
        unknown
      >);

      return (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: 'transparent' },
            getTransformsFor(i),
          ]}
          key={`child-${i}`}
          pointerEvents={currentPage === i ? 'auto' : 'none'}
        >
          {element}
        </Animated.View>
      );
    },
    [expandView, getTransformsFor, currentPage]
  );

  const expandStyle = expandView
    ? { top: -100, left: 0, width, height: height + 200 }
    : { width, height };

  const containerStyle =
    Platform.OS === 'android' ? styles.flex : styles.absolute;

  const panHandlers = panResponderRef.current?.panHandlers ?? {};

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading -- PanResponder handlers
    <Animated.View style={containerStyle} {...panHandlers}>
      <Animated.View style={[styles.blackFullScreen, expandStyle]}>
        {childrenArray.map((child, i) =>
          renderChild(child as React.ReactElement, i)
        )}
      </Animated.View>
    </Animated.View>
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
