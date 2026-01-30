import React from 'react';
import {
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  PanResponderGestureState,
  GestureResponderEvent,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const PERSPECTIVE = Platform.OS === 'ios' ? 2.38 : 2.2;
const TR_POSITION = Platform.OS === 'ios' ? 2 : 1.4;

export interface AndroidCubeEffectProps {
  children: React.ReactNode[];
  callBackAfterSwipe?: (page: number | string) => void;
  scrollLockPage?: number;
  expandView?: boolean;
  callbackOnSwipe?: (isSwiping: boolean) => void;
  loop?: boolean;
}

interface AndroidCubeEffectState {
  currentPage: number;
  scrollLockPage?: number;
}

export interface AndroidCubeEffectRef {
  scrollTo: (page: number, animated?: boolean) => void;
}

export default class AndroidCubeEffect extends React.Component<
  AndroidCubeEffectProps,
  AndroidCubeEffectState
> {
  pages: number[] = [];
  fullWidth: number = 0;
  _animatedValue!: Animated.ValueXY;
  _value: { x: number; y: number } = { x: 0, y: 0 };
  _panResponder!: ReturnType<typeof PanResponder.create>;
  _scrollView: React.ComponentRef<typeof Animated.View> | null = null;

  constructor(props: AndroidCubeEffectProps) {
    super(props);

    const children = React.Children.toArray(props.children);
    this.pages = children.map((_, index) => width * -index);
    this.fullWidth = (children.length - 1) * width;

    this.state = {
      currentPage: 0,
      scrollLockPage:
        props.scrollLockPage != null
          ? this.pages[props.scrollLockPage]
          : undefined,
    };
  }

  componentDidMount() {
    this._animatedValue = new Animated.ValueXY();
    this._animatedValue.setValue({ x: 0, y: 0 });
    this._value = { x: 0, y: 0 };

    this._animatedValue.addListener((value: { x: number; y: number }) => {
      this._value = value;
    });

    const onDoneSwiping = (gestureState: PanResponderGestureState) => {
      if (this.props.callbackOnSwipe) {
        this.props.callbackOnSwipe(false);
      }
      let mod = 0;

      if (gestureState.dx > 50) {
        mod = width / 2;
      } else if (gestureState.dx < -50) {
        mod = -width / 2;
      }
      const modPage = gestureState.dx > 0 ? 100 : -100;

      const currentPage = Math.abs(
        Number(this._closestPage(this._value.x + modPage))
      );
      const goTo = this._closest(this._value.x + mod);
      (
        this._animatedValue as Animated.ValueXY & {
          flattenOffset(v: { x: number; y: number }): void;
        }
      ).flattenOffset({
        x: this._value.x,
        y: this._value.y,
      });
      Animated.spring(this._animatedValue, {
        toValue: { x: goTo, y: 0 },
        friction: 5,
        tension: 0.6,
        useNativeDriver: false,
      }).start();
      setTimeout(() => {
        this.setState({ currentPage });
        if (this.props.callBackAfterSwipe) {
          this.props.callBackAfterSwipe(currentPage);
        }
      }, 500);
    };

    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => Math.abs(gestureState.dx) > 20,
      onPanResponderGrant: () => {
        if (this.props.callbackOnSwipe) {
          this.props.callbackOnSwipe(true);
        }
        this._animatedValue.stopAnimation();
        (
          this._animatedValue as Animated.ValueXY & {
            setOffset(v: { x: number; y: number }): void;
          }
        ).setOffset({ x: this._value.x, y: this._value.y });
      },
      onPanResponderMove: (
        e: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        if (this.props.loop) {
          if (gestureState.dx < 0 && this._value.x < -this.fullWidth) {
            (
              this._animatedValue as Animated.ValueXY & {
                setOffset(v: { x: number; y: number }): void;
              }
            ).setOffset({ x: width, y: 0 });
          } else if (gestureState.dx > 0 && this._value.x > 0) {
            (
              this._animatedValue as Animated.ValueXY & {
                setOffset(v: { x: number; y: number }): void;
              }
            ).setOffset({
              x: -(this.fullWidth + width),
              y: 0,
            });
          }
        }
        Animated.event([null, { dx: this._animatedValue.x }], {
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

    this.setState({});
  }

  componentDidUpdate(prevProps: AndroidCubeEffectProps) {
    if (
      this.props.scrollLockPage !== prevProps.scrollLockPage &&
      this.props.scrollLockPage != null
    ) {
      this.setState({
        scrollLockPage: this.pages[this.props.scrollLockPage],
      });
    }
  }

  scrollTo(page: number, animated: boolean = true): void {
    if (animated) {
      Animated.spring(this._animatedValue, {
        toValue: { x: this.pages[page], y: 0 },
        friction: 5,
        tension: 0.6,
        useNativeDriver: false,
      }).start();
    } else {
      this._animatedValue.setValue({ x: this.pages[page], y: 0 });
    }
    this.setState({ currentPage: page });
  }

  _getTransformsFor = (i: number) => {
    const scrollX = this._animatedValue.x;
    const pageX = -width * i;

    const translateX = scrollX.interpolate({
      inputRange: [pageX - width, pageX, pageX + width],
      outputRange: [(-width - 1) / TR_POSITION, 0, (width + 1) / TR_POSITION],
      extrapolate: 'clamp',
    });

    const rotateY = scrollX.interpolate({
      inputRange: [pageX - width, pageX, pageX + width],
      outputRange: ['-60deg', '0deg', '60deg'],
      extrapolate: 'clamp',
    });

    const translateXAfterRotate = scrollX.interpolate({
      inputRange: [
        pageX - width,
        pageX - width + 0.1,
        pageX,
        pageX + width - 0.1,
        pageX + width,
      ],
      outputRange: [
        -width - 1,
        (-width - 1) / PERSPECTIVE,
        0,
        (width + 1) / PERSPECTIVE,
        width + 1,
      ],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange: [
        pageX - width,
        pageX - width + 10,
        pageX,
        pageX + width - 250,
        pageX + width,
      ],
      outputRange: [0, 0.6, 1, 0.6, 0],
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
  };

  _renderChild = (child: React.ReactElement, i: number) => {
    const expandStyle = this.props.expandView
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
          this._getTransformsFor(i),
        ]}
        key={`child-${i}`}
      >
        {element}
      </Animated.View>
    );
  };

  _closest = (num: number): number => {
    const array = this.pages;
    let minDiff = 1000;
    let ans = array[0];
    for (let i = 0; i < array.length; i++) {
      const m = Math.abs(num - array[i]);
      if (m < minDiff) {
        minDiff = m;
        ans = array[i];
      }
    }
    return ans;
  };

  _closestPage = (num: number): number => {
    const array = this.pages;
    let minDiff = 1000;
    let ans = 0;
    for (let i = 0; i < array.length; i++) {
      const m = Math.abs(num - array[i]);
      if (m < minDiff) {
        minDiff = m;
        ans = i;
      }
    }
    return ans;
  };

  render() {
    const expandStyle = this.props.expandView
      ? { top: -100, left: 0, width, height: height + 200 }
      : { width, height };

    const children = React.Children.toArray(this.props.children);

    return (
      <Animated.View
        style={styles.flex}
        ref={(view) => {
          this._scrollView = view;
        }}
        {...(this._panResponder ? this._panResponder.panHandlers : {})}
      >
        <Animated.View style={[styles.blackFullScreen, expandStyle]}>
          {children.map((child, i) =>
            this._renderChild(child as React.ReactElement, i)
          )}
        </Animated.View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
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
