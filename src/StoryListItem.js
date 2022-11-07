import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator,
  View,
  Platform,
  SafeAreaView,
} from 'react-native';
// import type { IUserStoryItem } from './interfaces/IUserStory';
import { usePrevious } from './helpers/StateHelpers';
import { isNullOrWhitespace } from './helpers/ValidationHelpers';
import GestureRecognizer from 'react-native-swipe-gestures';

const { width, height } = Dimensions.get('window');

// type Props = {
//   profileName: string,
//   profileImage: string,
//   duration?: number,
//   onFinish?: function,
//   onClosePress: function,
//   key: number,
//   swipeText?: string,
//   customSwipeUpComponent?: any,
//   customCloseComponent?: any,
//   stories: IUserStoryItem[],
// };

export const StoryListItem = (props) => {
  const { stories } = props;

  const [load, setLoad] = useState(true);
  const [pressed, setPressed] = useState(false);
  const [content, setContent] = useState(
    stories.map((x) => {
      return {
        image: x.story_image,
        onPress: x.onPress,
        swipeText: x.swipeText,
        finish: 0,
      };
    }),
  );

  const [current, setCurrent] = useState(0);

  const progress = useRef(new Animated.Value(0)).current;

  const prevCurrentPage = usePrevious(props.currentPage);

  useEffect(() => {
    let isPrevious = prevCurrentPage > props.currentPage;
    if (isPrevious) {
      setCurrent(content.length - 1);
    } else {
      setCurrent(0);
    }

    let data = [...content];
    data.map((x, i) => {
      if (isPrevious) {
        x.finish = 1;
        if (i == content.length - 1) {
          x.finish = 0;
        }
      } else {
        x.finish = 0;
      }
    });
    setContent(data);
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currentPage]);

  const prevCurrent = usePrevious(current);

  useEffect(() => {
    if (!isNullOrWhitespace(prevCurrent)) {
      if (
        current > prevCurrent &&
        content[current - 1].image == content[current].image
      ) {
        start();
      } else if (
        current < prevCurrent &&
        content[current + 1].image == content[current].image
      ) {
        start();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function start() {
    setLoad(false);
    progress.setValue(0);
    startAnimation();
  }

  function startAnimation() {
    Animated.timing(progress, {
      toValue: 1,
      duration: props.duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        next();
      }
    });
  }

  function onSwipeUp() {
    if (props.onClosePress) {
      props.onClosePress();
    }
    if (content[current].onPress) {
      content[current].onPress();
    }
  }

  function onSwipeDown() {
    props?.onClosePress();
  }

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  function next() {
    // check if the next content is not empty
    setLoad(true);
    if (current !== content.length - 1) {
      let data = [...content];
      data[current].finish = 1;
      setContent(data);
      setCurrent(current + 1);
      progress.setValue(0);
    } else {
      // the next content is empty
      close('next');
    }
  }

  function previous() {
    // checking if the previous content is not empty
    setLoad(true);
    if (current - 1 >= 0) {
      let data = [...content];
      data[current].finish = 0;
      setContent(data);
      setCurrent(current - 1);
      progress.setValue(0);
    } else {
      // the previous content is empty
      close('previous');
    }
  }

  function close(state) {
    let data = [...content];
    data.map((x) => (x.finish = 0));
    setContent(data);
    progress.setValue(0);
    if (props.currentPage == props.index) {
      if (props.onFinish) {
        props.onFinish(state);
      }
    }
  }

  const swipeText =
    content?.[current]?.swipeText || props.swipeText || 'Swipe Up';

  return (
    <GestureRecognizer
      onSwipeUp={(state) => onSwipeUp(state)}
      onSwipeDown={(state) => onSwipeDown(state)}
      config={config}
      style={{
        flex: 1,
        backgroundColor: 'black',
      }}
    >
      <SafeAreaView>
        <View style={styles.backgroundContainer}>
          <Image
            onLoadEnd={() => start()}
            source={{ uri: content[current].image }}
            style={styles.image}
          />
          {load && (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color={'white'} />
            </View>
          )}
        </View>
      </SafeAreaView>
      <View style={{ flexDirection: 'column', flex: 1 }}>
        <View style={styles.animationBarContainer}>
          {content.map((index, key) => {
            return (
              <View key={key} style={styles.animationBackground}>
                <Animated.View
                  style={{
                    flex: current == key ? progress : content[key].finish,
                    height: 2,
                    backgroundColor: 'white',
                  }}
                />
              </View>
            );
          })}
        </View>
        <View style={styles.userContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              style={styles.avatarImage}
              source={{ uri: props.profileImage }}
            />
            <Text style={styles.avatarText}>{props.profileName}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (props.onClosePress) {
                props.onClosePress();
              }
            }}
          >
            <View style={styles.closeIconContainer}>
              {props.customCloseComponent ? (
                props.customCloseComponent
              ) : (
                <Text style={{ color: 'white' }}>X</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.pressContainer}>
          <TouchableWithoutFeedback
            onPressIn={() => progress.stopAnimation()}
            onLongPress={() => setPressed(true)}
            onPressOut={() => {
              setPressed(false);
              startAnimation();
            }}
            onPress={() => {
              if (!pressed && !load) {
                previous();
              }
            }}
          >
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPressIn={() => progress.stopAnimation()}
            onLongPress={() => setPressed(true)}
            onPressOut={() => {
              setPressed(false);
              startAnimation();
            }}
            onPress={() => {
              if (!pressed && !load) {
                next();
              }
            }}
          >
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </View>
      </View>
      {content[current].onPress && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={onSwipeUp}
          style={styles.swipeUpBtn}
        >
          {props.customSwipeUpComponent ? (
            props.customSwipeUpComponent
          ) : (
            <>
              <Text style={{ color: 'white', marginTop: 5 }}></Text>
              <Text style={{ color: 'white', marginTop: 5 }}>{swipeText}</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </GestureRecognizer>
  );
};

StoryListItem.propTypes = {
  profileName: PropTypes.string,
  profileImage: PropTypes.string,
  duration: PropTypes.number,
  onFinish: PropTypes.func,
  onClosePress: PropTypes.func,
  key: PropTypes.number,
  swipeText: PropTypes.string,
  customSwipeUpComponent: PropTypes.any,
  customCloseComponent: PropTypes.any,
  stories: PropTypes.array,
  currentPage: PropTypes.number,
  index: PropTypes.number,
};

export default StoryListItem;

StoryListItem.defaultProps = {
  duration: 10000,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  spinnerContainer: {
    zIndex: -100,
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: 'black',
    alignSelf: 'center',
    width: width,
    height: height,
  },
  animationBarContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  animationBackground: {
    height: 2,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(117, 117, 117, 0.5)',
    marginHorizontal: 2,
  },
  userContainer: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  avatarImage: {
    height: 30,
    width: 30,
    borderRadius: 100,
  },
  avatarText: {
    fontWeight: 'bold',
    color: 'white',
    paddingLeft: 10,
  },
  closeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    paddingHorizontal: 15,
  },
  pressContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  swipeUpBtn: {
    position: 'absolute',
    right: 0,
    left: 0,
    alignItems: 'center',
    bottom: Platform.OS == 'ios' ? 20 : 50,
  },
});
