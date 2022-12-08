import React, { Fragment, useRef, useState, useEffect } from 'react';
import { Dimensions, View, Platform, Image } from 'react-native';
import Modal from 'react-native-modalbox';

import StoryListItem from './StoryListItem';
import StoryCircleListView from './StoryCircleListView';
import { isNullOrWhitespace } from './helpers';
import AndroidCubeEffect from './components/AndroidCubeEffect';
import CubeNavigationHorizontal from './components/CubeNavigationHorizontal';
import { IUserStory, NextOrPrevious, StoryProps } from './interfaces';

export const Story = ({
  data,
  unPressedBorderColor,
  pressedBorderColor,
  style,
  onStart,
  onClose,
  duration,
  swipeText,
  customSwipeUpComponent,
  customCloseComponent,
  avatarSize,
  showAvatarText,
  avatarTextStyle,
  ImageComponent,
  ImageComponentStyle
}: StoryProps) => {
  const [dataState, setDataState] = useState<IUserStory[]>(data);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedData, setSelectedData] = useState<IUserStory[]>([]);
  const cube = useRef<any>();

  // Component Functions
  const _handleStoryItemPress = (item: IUserStory, index?: number) => {
    const newData = dataState.slice(index);
    if (onStart) {
      onStart(item);
    }

    setCurrentPage(0);
    setSelectedData(newData);
    setIsModalOpen(true);
  };

  useEffect(() => {
    handleSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSeen = () => {
    const seen = selectedData[currentPage];
    const seenIndex = dataState.indexOf(seen);
    if (seenIndex > 0) {
      if (!dataState[seenIndex]?.seen) {
        let tempData = dataState;
        dataState[seenIndex] = {
          ...dataState[seenIndex],
          seen: true,
        };
        setDataState(tempData);
      }
    }
  };

  function onStoryFinish(state: NextOrPrevious) {
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
  }

  const renderStoryList = () =>
    selectedData.map((x, i) => {
      return (
        <StoryListItem
          duration={duration * 1000}
          key={i}
          profileName={x.user_name}
          profileImage={x.user_image}
          stories={x.stories}
          currentPage={currentPage}
          onFinish={onStoryFinish}
          swipeText={swipeText}
          customSwipeUpComponent={customSwipeUpComponent}
          customCloseComponent={customCloseComponent}
          onClosePress={() => {
            setIsModalOpen(false);
            if (onClose) {
              onClose(x);
            }
          }}
          index={i}
        />
      );
    });

  const renderCube = () => {
    if (Platform.OS == 'ios') {
      return (
        <CubeNavigationHorizontal
          ref={cube}
          callBackAfterSwipe={(x: any) => {
            if (x != currentPage) {
              setCurrentPage(parseInt(x));
            }
          }}
        >
          {renderStoryList()}
        </CubeNavigationHorizontal>
      );
    } else {
      return (
        <AndroidCubeEffect
          ref={cube}
          callBackAfterSwipe={(x: any) => {
            if (x != currentPage) {
              setCurrentPage(parseInt(x));
            }
          }}
        >
          {renderStoryList()}
        </AndroidCubeEffect>
      );
    }
  };

  return (
    <Fragment>
      <View style={style}>
        <StoryCircleListView
          handleStoryItemPress={_handleStoryItemPress}
          data={dataState}
          avatarSize={avatarSize}
          unPressedBorderColor={unPressedBorderColor}
          pressedBorderColor={pressedBorderColor}
          showText={showAvatarText}
          textStyle={avatarTextStyle}
          ImageComponentStyle={ImageComponentStyle}
          ImageComponent={ImageComponent}
        />
      </View>
      <Modal
        style={{
          flex: 1,
          height: Dimensions.get('window').height,
          width: Dimensions.get('window').width,
        }}
        isOpen={isModalOpen}
        onClosed={() => setIsModalOpen(false)}
        position="center"
        swipeToClose
        swipeArea={250}
        backButtonClose
        coverScreen={true}
      >
        {renderCube()}
      </Modal>
    </Fragment>
  );
};

export default Story;

Story.defaultProps = {
  showAvatarText: true,
  ImageComponent: Image
};
