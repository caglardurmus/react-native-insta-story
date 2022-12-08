import React from 'react';
import { View, FlatList } from 'react-native';
import StoryCircleListItem from './StoryCircleListItem';
import { StoryCircleListViewProps } from 'src/interfaces';

const StoryCircleListView = ({
  data,
  handleStoryItemPress,
  unPressedBorderColor,
  pressedBorderColor,
  avatarSize,
  showText,
  textStyle,
  ImageComponentStyle,
  ImageComponent,
  HeaderComponent
}: StoryCircleListViewProps) => {
  return (
    <View>
      <FlatList
        keyExtractor={(_item, index) => index.toString()}
        data={data}
        horizontal
        style={{ paddingLeft: 12 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={HeaderComponent}
        ListFooterComponent={<View style={{ flex: 1, width: 8 }} />}
        renderItem={({ item, index }) => (
          <StoryCircleListItem
            avatarSize={avatarSize}
            handleStoryItemPress={() =>
              handleStoryItemPress && handleStoryItemPress(item, index)
            }
            unPressedBorderColor={unPressedBorderColor}
            pressedBorderColor={pressedBorderColor}
            item={item}
            showText={showText}
            textStyle={textStyle}
            ImageComponentStyle={ImageComponentStyle}
            ImageComponent={ImageComponent}
          />
        )}
      />
    </View>
  );
};

export default StoryCircleListView;
