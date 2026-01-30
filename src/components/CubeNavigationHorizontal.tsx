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

const PERSPECTIVE = Platform.OS === 'ios' ? 2.38 : 1.7;
const TR_POSITION = Platform.OS === 'ios' ? 2 : 1.5;

export interface CubeNavigationHorizontalProps {
  children: React.ReactNode[];
  callBackAfterSwipe?: (page: number | string) => void;
  callbackOnSwipe?: (isSwiping: boolean) => void;
  scrollLockPage?: number;
  responderCaptureDx?: number;
  expandView?: boolean;
  loop?: boolean;
}

interface CubeNavigationHorizontalState {
  currentPage: number;
  scrollLockPage?: number;
}

export interface CubeNavigationHorizontalRef {
  scrollTo: (page: number, animated?: boolean) => void;
}

export default class CubeNavigationHorizontal extends React.Component<
  CubeNavigationHorizontalProps,
  CubeNavigationHorizontalState
> {
  pages: number[] = [];
  fullWidth: number = 0;
  _animatedValue!: Animated.ValueXY;
  _value: { x: number; y: number } = { x: 0, y: 0 };
  _panResponder!: ReturnType<typeof PanResponder.create>;
  _scrollView: React.ComponentRef<typeof Animated.View> | null = null;

  constructor(props: CubeNavigationHorizontalProps) {
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

    const responderCaptureDx = this.props.responderCaptureDx ?? 60;

    const onDoneSwiping = (gestureState: PanResponderGestureState) => {
      if (this.props.callbackOnSwipe) {
        this.props.callbackOnSwipe(false);
      }
      const mod = gestureState.dx > 0 ? 100 : -100;
      const currentPage = this._closest(this._value.x + mod);
      const goTo = this.pages[currentPage];
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
      ) => Math.abs(gestureState.dx) > responderCaptureDx,
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

  componentDidUpdate(prevProps: CubeNavigationHorizontalProps) {
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
    const loopVariable = (variable: number, sign: number = 1): number =>
      variable + Math.sign(sign) * (this.fullWidth + width);
    const padInput = (variables: number[]): number[] => {
      if (!this.props.loop) return variables;
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
      if (!this.props.loop) return variables;
      const returnedVariables = [...variables];
      returnedVariables.unshift(...variables);
      returnedVariables.push(...variables);
      return returnedVariables;
    };

    const translateX = scrollX.interpolate({
      inputRange: padInput([pageX - width, pageX, pageX + width]),
      outputRange: padOutput([
        (-width - 1) / TR_POSITION,
        0,
        (width + 1) / TR_POSITION,
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
        (-width - 1) / PERSPECTIVE,
        0,
        (width + 1) / PERSPECTIVE,
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
        pointerEvents={this.state.currentPage === i ? 'auto' : 'none'}
      >
        {element}
      </Animated.View>
    );
  };

  _closest = (num: number): number => {
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
        style={styles.absolute}
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
  absolute: {
    position: 'absolute',
  },
  blackFullScreen: {
    backgroundColor: '#000',
    position: 'absolute',
    width,
    height,
  },
});
