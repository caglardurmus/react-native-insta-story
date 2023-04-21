import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import StoryCircleListItem from './StoryCircleListItem';
import { StoryCircleListViewProps } from 'src/interfaces';

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
      keyExtractor={(_item, index) => index.toString()}
      data={data}
      horizontal
      style={styles.paddingLeft}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      ListFooterComponent={<View style={styles.footer} />}
      renderItem={({ item, index }) => (
        <StoryCircleListItem
          avatarSize={avatarSize}
          handleStoryItemPress={() =>
            handleStoryItemPress && handleStoryItemPress(item, index)
          }
          unPressedBorderColor={unPressedBorderColor}
          pressedBorderColor={pressedBorderColor}
          unPressedAvatarTextColor={unPressedAvatarTextColor}
          pressedAvatarTextColor={pressedAvatarTextColor}
          item={item}
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
