import React, { useCallback, useState, useEffect, useRef } from 'react';
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
import GestureRecognizer from 'react-native-swipe-gestures';

import { usePrevious, getStoryMediaType } from './helpers';
import {
  IUserStoryItem,
  NextOrPrevious,
  StoryListItemProps,
} from './interfaces';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const SWIPE_CONFIG = {
  velocityThreshold: 0.3,
  directionalOffsetThreshold: 80,
};

export const StoryListItem = ({
  index,
  key,
  userId,
  profileImage,
  profileName,
  duration = 10000,
  onFinish,
  onClosePress,
  stories,
  currentPage,
  isModalOpen = true,
  onStorySeen,
  renderCloseComponent,
  renderSwipeUpComponent,
  renderTextComponent,
  loadedAnimationBarStyle,
  unloadedAnimationBarStyle,
  animationBarContainerStyle,
  storyUserContainerStyle,
  storyImageStyle,
  storyAvatarImageStyle,
  storyContainerStyle,
  ...props
}: StoryListItemProps) => {
  const [load, setLoad] = useState<boolean>(true);
  const [pressed, setPressed] = useState<boolean>(false);
  const [isInteractionPaused, setIsInteractionPaused] =
    useState<boolean>(false);
  const videoDurationRef = useRef<number>(1);
  const [content, setContent] = useState<IUserStoryItem[]>(
    stories.map((x) => ({
      ...x,
      finish: 0,
    }))
  );

  const [current, setCurrent] = useState(0);
  const [barContainerWidth, setBarContainerWidth] = useState(0);

  const progress = useRef(new Animated.Value(0)).current;

  const prevCurrentPage = usePrevious(currentPage);

  useEffect(() => {
    let isPrevious =
      typeof prevCurrentPage === 'number' && prevCurrentPage > currentPage;
    if (isPrevious) {
      setCurrent(content.length - 1);
    } else {
      setCurrent(0);
    }

    const data = content.map((x, i) => ({
      ...x,
      finish: isPrevious ? (i === content.length - 1 ? 0 : 1) : 0,
    }));
    setContent(data);
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const prevCurrent = usePrevious(current);
  const prevCurrentRef = useRef(current);

  // Single effect for current change: go back => start(); same-image neighbor => start()
  useEffect(() => {
    const prevRef = prevCurrentRef.current;
    prevCurrentRef.current = current;
    if (current < prevRef) {
      start();
      return;
    }
    if (typeof prevCurrent === 'number' && prevCurrent !== current) {
      const sameImagePrev =
        content[current - 1]?.story_image === content[current]?.story_image;
      const sameImageNext =
        content[current + 1]?.story_image === content[current]?.story_image;
      if (
        (current > prevCurrent && sameImagePrev) ||
        (current < prevCurrent && sameImageNext)
      ) {
        start();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when current changes
  }, [current]);

  const currentMediaType = getStoryMediaType(content[current]);
  const isVideo = currentMediaType === 'video' && Video;

  const close = useCallback(
    (state: NextOrPrevious) => {
      setContent((prev) => prev.map((x) => ({ ...x, finish: 0 })));
      progress.setValue(0);
      if (currentPage === index && onFinish) {
        onFinish(state);
      }
    },
    [currentPage, index, onFinish, progress]
  );

  const next = useCallback(() => {
    setLoad(true);
    if (current !== content.length - 1) {
      setContent((prev) =>
        prev.map((x, i) => (i === current ? { ...x, finish: 1 } : x))
      );
      setCurrent(current + 1);
      progress.setValue(0);
    } else {
      close('next');
    }
  }, [content, current, close, progress]);

  const previous = useCallback(() => {
    setLoad(true);
    if (current - 1 >= 0) {
      setContent((prev) =>
        prev.map((x, i) => (i === current ? { ...x, finish: 0 } : x))
      );
      setCurrent(current - 1);
      progress.setValue(0);
    } else {
      close('previous');
    }
  }, [current, close, progress]);

  const startAnimation = useCallback(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        next();
      }
    });
  }, [duration, next, progress]);

  const start = useCallback(() => {
    setLoad(false);
    progress.setValue(0);
    const isCurrentVideo =
      getStoryMediaType(content[current]) === 'video' && Video;
    if (!isCurrentVideo) {
      startAnimation();
    }
  }, [content, current, progress, startAnimation]);

  const onSwipeUp = useCallback(() => {
    if (onClosePress) {
      onClosePress();
    }
    if (content[current]?.onPress) {
      content[current].onPress?.();
    }
  }, [onClosePress, content, current]);

  const onSwipeDown = useCallback(() => {
    onClosePress?.();
  }, [onClosePress]);

  const swipeText =
    content?.[current]?.swipeText || props.swipeText || 'Swipe Up';

  const isActiveCubePage = currentPage === index;
  const shouldRenderVideo =
    isModalOpen && isActiveCubePage && isVideo && content[current].story_video;

  React.useEffect(() => {
    if (onStorySeen && currentPage === index) {
      onStorySeen({
        user_id: userId,
        user_image: profileImage,
        user_name: profileName,
        story: content[current],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when page/index/current change
  }, [currentPage, index, onStorySeen, current]);

  return (
    <GestureRecognizer
      key={key}
      onSwipeUp={onSwipeUp}
      onSwipeDown={onSwipeDown}
      config={SWIPE_CONFIG}
      style={[styles.container, storyContainerStyle]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.backgroundContainer}>
          {shouldRenderVideo && Video ? (
            <View style={styles.videoWrapper}>
              <Video
                key={content[current].story_id}
                source={{ uri: content[current].story_video }}
                resizeMode="cover"
                poster={
                  content[current].story_image
                    ? { uri: content[current].story_image }
                    : undefined
                }
                posterResizeMode="cover"
                style={StyleSheet.absoluteFillObject}
                onLoad={(e: { duration: number }) => {
                  const d = e?.duration ?? 1;
                  videoDurationRef.current = d;
                  start();
                }}
                onProgress={(e: { currentTime: number }) => {
                  const dur = videoDurationRef.current;
                  if (dur > 0) {
                    progress.setValue(e.currentTime / dur);
                  }
                }}
                onEnd={() => next()}
                onError={() => start()}
                paused={isInteractionPaused}
                repeat={false}
                controls={false}
                showNotificationControls={false}
                hideShutterView
                {...(Platform.OS === 'android' && {
                  useTextureView: true,
                })}
              />
            </View>
          ) : isVideo &&
            content[current].story_video &&
            content[current].story_image ? (
            <Image
              key={content[current].story_id}
              source={{ uri: content[current].story_image }}
              style={[styles.image, storyImageStyle]}
              resizeMode="cover"
            />
          ) : content[current].story_image ? (
            <Image
              key={content[current].story_id}
              onLoadEnd={() => start()}
              source={{ uri: content[current].story_image }}
              style={[styles.image, storyImageStyle]}
            />
          ) : (
            <View
              key={content[current].story_id}
              style={[styles.image, { backgroundColor: '#000' }]}
              onLayout={() => start()}
            />
          )}
          {load && (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color={'white'} />
            </View>
          )}
        </View>
        <View style={styles.flexCol}>
          <View
            style={[styles.animationBarContainer, animationBarContainerStyle]}
            onLayout={(e) => setBarContainerWidth(e.nativeEvent.layout.width)}
          >
            {content.map((storyItem, idx) => {
              const segmentWidth =
                barContainerWidth > 0 && content.length > 0
                  ? (barContainerWidth - 20 - content.length * 4) /
                    content.length
                  : 0;
              const fillWidth = Math.max(0, segmentWidth);
              const isActive = current === idx;
              const isFinished = storyItem.finish === 1;
              return (
                <View
                  key={storyItem.story_id}
                  style={[
                    styles.animationBackground,
                    unloadedAnimationBarStyle,
                    segmentWidth > 0 && {
                      width: segmentWidth + 4,
                      flex: undefined,
                      overflow: 'hidden',
                    },
                  ]}
                >
                  {segmentWidth > 0 && isActive ? (
                    <Animated.View
                      style={[
                        {
                          width: fillWidth,
                          height: 2,
                          backgroundColor: 'white',
                          transform: [
                            {
                              translateX: progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-fillWidth, 0],
                              }),
                            },
                          ],
                        },
                        loadedAnimationBarStyle,
                      ]}
                    />
                  ) : isFinished ? (
                    <View
                      style={[
                        {
                          width: fillWidth,
                          height: 2,
                          backgroundColor: 'white',
                        },
                        loadedAnimationBarStyle,
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        {
                          height: 2,
                          flex: 1,
                          backgroundColor: 'rgba(117, 117, 117, 0.5)',
                        },
                        unloadedAnimationBarStyle,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
          <View style={[styles.userContainer, storyUserContainerStyle]}>
            <View style={styles.flexRowCenter}>
              <Image
                style={[styles.avatarImage, storyAvatarImageStyle]}
                source={{ uri: profileImage }}
              />
              {typeof renderTextComponent === 'function' ? (
                renderTextComponent({
                  item: content[current],
                  profileName,
                })
              ) : (
                <Text style={styles.avatarText}>{profileName}</Text>
              )}
            </View>
            <View style={styles.closeIconContainer}>
              {typeof renderCloseComponent === 'function' ? (
                renderCloseComponent({
                  onPress: onClosePress,
                  item: content[current],
                })
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    if (onClosePress) {
                      onClosePress();
                    }
                  }}
                >
                  <Text style={styles.whiteText}>X</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.pressContainer}>
            <TouchableWithoutFeedback
              onPressIn={() => {
                setIsInteractionPaused(true);
                progress.stopAnimation();
              }}
              onLongPress={() => setPressed(true)}
              onPressOut={() => {
                setIsInteractionPaused(false);
                setPressed(false);
                if (!isVideo) {
                  startAnimation();
                }
              }}
              onPress={() => {
                if (!pressed && !load) {
                  previous();
                }
              }}
            >
              <View style={styles.flex} />
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback
              onPressIn={() => {
                setIsInteractionPaused(true);
                progress.stopAnimation();
              }}
              onLongPress={() => setPressed(true)}
              onPressOut={() => {
                setIsInteractionPaused(false);
                setPressed(false);
                if (!isVideo) {
                  startAnimation();
                }
              }}
              onPress={() => {
                if (!pressed && !load) {
                  next();
                }
              }}
            >
              <View style={styles.flex} />
            </TouchableWithoutFeedback>
          </View>
        </View>
      </SafeAreaView>
      {typeof renderSwipeUpComponent === 'function' ? (
        renderSwipeUpComponent({
          onPress: onSwipeUp,
          item: content[current],
        })
      ) : (
        <TouchableOpacity
          activeOpacity={1}
          onPress={onSwipeUp}
          style={styles.swipeUpBtn}
        >
          <Text style={styles.swipeText}></Text>
          <Text style={styles.swipeText}>{swipeText}</Text>
        </TouchableOpacity>
      )}
    </GestureRecognizer>
  );
};

export default StoryListItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  flex: {
    flex: 1,
  },
  flexCol: {
    flex: 1,
    flexDirection: 'column',
  },
  flexRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
  },
  videoWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    height,
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
  whiteText: {
    color: 'white',
  },
  swipeText: {
    color: 'white',
    marginTop: 5,
  },
});
