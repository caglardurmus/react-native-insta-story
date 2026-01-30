import React from 'react';
import { View, FlatList, StyleSheet, Platform } from 'react-native';
import StoryCircleListItem from './StoryCircleListItem';
import { IUserStory, StoryCircleListViewProps } from './interfaces';

const ListFooter = () => <View style={styles.footer} />;

const StoryCircleListView = ({
  data,
  handleStoryItemPress,
  unPressedBorderColor,
  pressedBorderColor,
  unPressedAvatarTextColor,
  pressedAvatarTextColor,
  avatarSize,
  showText,
  avatarTextStyle,
  avatarImageStyle,
  avatarWrapperStyle,
  avatarFlatListProps,
}: StoryCircleListViewProps) => {
  return (
    <FlatList
      keyExtractor={(item: IUserStory) => item.user_id.toString()}
      data={data}
      horizontal
      style={styles.paddingLeft}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      ListFooterComponent={ListFooter}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={5}
      removeClippedSubviews={Platform.OS === 'android'}
      renderItem={({ item, index }) => (
        <StoryCircleListItem
          avatarSize={avatarSize}
          handleStoryItemPress={handleStoryItemPress}
          unPressedBorderColor={unPressedBorderColor}
          pressedBorderColor={pressedBorderColor}
          unPressedAvatarTextColor={unPressedAvatarTextColor}
          pressedAvatarTextColor={pressedAvatarTextColor}
          item={item}
          index={index}
          showText={showText}
          avatarTextStyle={avatarTextStyle}
          avatarImageStyle={avatarImageStyle}
          avatarWrapperStyle={avatarWrapperStyle}
        />
      )}
      {...avatarFlatListProps}
    />
  );
};

const styles = StyleSheet.create({
  paddingLeft: {
    paddingLeft: 12,
  },
  footer: {
    flex: 1,
    width: 8,
  },
});

export default StoryCircleListView;
