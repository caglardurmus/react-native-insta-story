"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const StoryCircleListItem_1 = __importDefault(require("./StoryCircleListItem"));
const StoryCircleListView = ({ data, handleStoryItemPress, unPressedBorderColor, pressedBorderColor, avatarSize, showText, textStyle, ImageComponentStyle, ImageComponent, HeaderComponent }) => {
    return (<react_native_1.View>
      <react_native_1.FlatList keyExtractor={(_item, index) => index.toString()} data={data} horizontal style={{ paddingLeft: 12 }} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} ListHeaderComponent={HeaderComponent} ListFooterComponent={<react_native_1.View style={{ flex: 1, width: 8 }}/>} renderItem={({ item, index }) => (<StoryCircleListItem_1.default avatarSize={avatarSize} handleStoryItemPress={() => handleStoryItemPress && handleStoryItemPress(item, index)} unPressedBorderColor={unPressedBorderColor} pressedBorderColor={pressedBorderColor} item={item} showText={showText} textStyle={textStyle} ImageComponentStyle={ImageComponentStyle} ImageComponent={ImageComponent}/>)}/>
    </react_native_1.View>);
};
exports.default = StoryCircleListView;
