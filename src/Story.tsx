import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import Modal from 'react-native-modalbox';

import StoryCircleListView from './StoryCircleListView';
import StoryListItem from './StoryListItem';
import CubeNavigationHorizontal, {
  CubeNavigationHorizontalRef,
} from './components/CubeNavigationHorizontal';
import { isNullOrWhitespace } from './helpers';
import { IUserStory, NextOrPrevious, StoryProps } from './interfaces';

const { height, width } = Dimensions.get('window');

export const Story = ({
  data,
  unPressedBorderColor,
  pressedBorderColor,
  unPressedAvatarTextColor,
  pressedAvatarTextColor,
  style,
  onStart,
  onClose,
  duration,
  swipeText,
  avatarSize,
  showAvatarText = true,
  avatarTextStyle,
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
  avatarImageStyle,
  avatarWrapperStyle,
  avatarFlatListProps,
}: StoryProps) => {
  const [dataState, setDataState] = useState<IUserStory[]>(data);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedData, setSelectedData] = useState<IUserStory[]>([]);
  const cube = useRef<CubeNavigationHorizontalRef | null>(null);

  const _handleStoryItemPress = useCallback(
    (item: IUserStory, index?: number) => {
      const newData = dataState.slice(typeof index === 'number' ? index : 0);
      if (onStart) {
        onStart(item);
      }
      setCurrentPage(0);
      setSelectedData(newData);
      setIsModalOpen(true);
    },
    [dataState, onStart]
  );

  const handleSeen = useCallback(() => {
    setDataState((prev) => {
      const seen = selectedData[currentPage];
      const seenIndex = prev.indexOf(seen);
      if (seenIndex > 0 && !prev[seenIndex]?.seen) {
        const next = [...prev];
        next[seenIndex] = { ...next[seenIndex], seen: true };
        return next;
      }
      return prev;
    });
  }, [selectedData, currentPage]);

  useEffect(() => {
    handleSeen();
  }, [currentPage, handleSeen]);

  useEffect(() => {
    if (!isModalOpen || Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setIsModalOpen(false);
        if (onClose && selectedData.length > 0) {
          onClose(
            selectedData[currentPage] ?? selectedData[selectedData.length - 1]
          );
        }
        setCurrentPage(0);
        return true;
      }
    );
    return () => subscription.remove();
  }, [isModalOpen, onClose, selectedData, currentPage]);

  const handleCloseModal = useCallback(
    (user: IUserStory) => {
      setIsModalOpen(false);
      if (onClose) {
        onClose(user);
      }
    },
    [onClose]
  );

  const onStoryFinish = useCallback(
    (state: NextOrPrevious) => {
      if (!isNullOrWhitespace(state)) {
        if (state == 'next') {
          const newPage = currentPage + 1;
          if (newPage < selectedData.length) {
            setCurrentPage(newPage);
            cube?.current?.scrollTo(newPage);
          } else {
            setIsModalOpen(false);
            setCurrentPage(0);
            if (onClose) {
              onClose(selectedData[selectedData.length - 1]);
            }
          }
        } else if (state == 'previous') {
          const newPage = currentPage - 1;
          if (newPage < 0) {
            setIsModalOpen(false);
            setCurrentPage(0);
          } else {
            setCurrentPage(newPage);
            cube?.current?.scrollTo(newPage);
          }
        }
      }
    },
    [currentPage, selectedData, onClose]
  );

  const callBackAfterSwipe = useCallback((x: string | number) => {
    const page = Number(x);
    setCurrentPage((prev) => (prev !== page ? page : prev));
  }, []);

  const storyListElements = selectedData.map((x, i) => (
    <StoryListItem
      key={x.user_id}
      duration={duration * 1000}
      userId={x.user_id}
      profileName={x.user_name}
      profileImage={x.user_image}
      stories={x.stories}
      currentPage={currentPage}
      isModalOpen={isModalOpen}
      onFinish={onStoryFinish}
      swipeText={swipeText}
      renderSwipeUpComponent={renderSwipeUpComponent}
      renderCloseComponent={renderCloseComponent}
      renderTextComponent={renderTextComponent}
      onClosePress={() => handleCloseModal(x)}
      index={i}
      onStorySeen={onStorySeen}
      unloadedAnimationBarStyle={unloadedAnimationBarStyle}
      animationBarContainerStyle={animationBarContainerStyle}
      loadedAnimationBarStyle={loadedAnimationBarStyle}
      storyUserContainerStyle={storyUserContainerStyle}
      storyImageStyle={storyImageStyle}
      storyAvatarImageStyle={storyAvatarImageStyle}
      storyContainerStyle={storyContainerStyle}
    />
  ));

  return (
    <Fragment>
      <View style={style}>
        <StoryCircleListView
          handleStoryItemPress={_handleStoryItemPress}
          data={dataState}
          avatarSize={avatarSize}
          unPressedBorderColor={unPressedBorderColor}
          pressedBorderColor={pressedBorderColor}
          unPressedAvatarTextColor={unPressedAvatarTextColor}
          pressedAvatarTextColor={pressedAvatarTextColor}
          showText={showAvatarText}
          avatarTextStyle={avatarTextStyle}
          avatarWrapperStyle={avatarWrapperStyle}
          avatarImageStyle={avatarImageStyle}
          avatarFlatListProps={avatarFlatListProps}
        />
      </View>
      <Modal
        style={styles.modal}
        isOpen={isModalOpen}
        onClosed={() => setIsModalOpen(false)}
        position="center"
        swipeToClose
        swipeArea={250}
        coverScreen={true}
      >
        <CubeNavigationHorizontal
          ref={cube}
          callBackAfterSwipe={callBackAfterSwipe}
        >
          {storyListElements}
        </CubeNavigationHorizontal>
      </Modal>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    height,
    width,
  },
});

export default Story;
