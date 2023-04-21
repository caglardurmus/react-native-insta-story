import { ReactNode } from 'react';
import { ColorValue, ImageStyle, TextStyle, ViewStyle } from 'react-native';

export type NextOrPrevious = 'next' | 'previous';

export interface IUserStory<T = Record<string, any>> {
  user_id: number;
  user_image: string | undefined;
  user_name: string;
  stories: IUserStoryItem<T>[];
  /** INTERNAL USE ONLY */
  seen?: boolean;
}

export interface IUserStoryItem<T = Record<string, any>> {
  story_id: number;
  story_image: string | undefined;
  /** Function that gets called when the swipe up button is pressed */
  onPress?: (props?: any) => any;
  swipeText?: string;
  /** Add your own custom props to access in the custom render methods */
  customProps?: T;
  /** FOR INTERNAL USE ONLY */
  finish?: number;
}

export interface CustomButtonRenderProps<T = Record<string, any>> {
  onPress: (props?: any) => any;
  item: IUserStoryItem<T>;
}

export type RenderCustomButton<T = Record<string, any>> = (
  props: CustomButtonRenderProps<T>,
) => React.ReactNode;

export interface TextRenderProps<T = Record<string, any>> {
  profileName: string;
  item: IUserStoryItem<T>;
}

export type RenderCustomText = (props: TextRenderProps) => React.ReactNode;

interface SharedCircleListProps {
  handleStoryItemPress: (item: IUserStory, index?: number) => void;
  /** The color of the avatar border when unseen */
  unPressedBorderColor?: ColorValue;
  /** The color of the avatar border when seen */
  pressedBorderColor?: ColorValue;
  /** A custom size for the avatar rendered in the FlatList */
  avatarSize?: number;
  /** Display username below avatars in FlatList */
  showText?: boolean;
  /** Username text style below the avatar */
  textStyle?: TextStyle;
}

export interface StoryCircleListViewProps extends SharedCircleListProps {
  data: IUserStory[];
}

export interface StoryCircleListItemProps extends SharedCircleListProps {
  item: IUserStory;
}

// TODO: add JSDoc comments where necessary
export interface StoryListItemProps {
  index: number;
  key: number;
  /** Name of the user - IUserStory.user_name */
  profileName: string;
  /** Profile picture of the user - IUserStory.user_image */
  profileImage: string | undefined;
  /** Time in seconds */
  duration: number;
  /** Text of the swipe up button */
  swipeText?: string;
  /**
   * Callback which returns a custom React Element to use as the
   * swipeUpComponent. IUserStoryItem is passed as an arg.
   */
  renderSwipeUpComponent?: RenderCustomButton;
  /**
   * Callback which returns a custom React Element to use as the
   * closeComponent. IUserStoryItem is passed as an arg.
   */
  renderCloseComponent?: RenderCustomButton;
  /**
   * Callback which returns a custom React Element to use as the textComponent.
   * IUserStoryItem and username are passed as args.
   */
  renderTextComponent?: RenderCustomText;
  onFinish?: (props?: any) => any;
  onClosePress: (props?: any) => any;
  stories: IUserStoryItem[];
  currentPage: number;
}

export interface StoryProps {
  /** An array of IUserStory's */
  data: IUserStory[];
  /** Time in seconds */
  duration: number;
  /** A custom size for the avatar rendered in the FlatList */
  avatarSize?: number;
  /** Style prop for the avatar FlatList container */
  style?: ViewStyle;
  /** The color of the avatar border when unseen */
  unPressedBorderColor?: TextStyle['color'];
  /** The color of the avatar border when seen */
  pressedBorderColor?: TextStyle['color'];
  /** Called when story item close button is pressed */
  onClose?: (props?: IUserStory) => any;
  /** Called when story item is loaded */
  onStart?: (props?: IUserStory) => any;
  /** Text of the swipe up button */
  swipeText?: string;
  /**
   * Callback which returns a custom React Element to use as the
   * swipeUpComponent. IUserStoryItem is passed as an arg.
   */
  renderSwipeUpComponent?: RenderCustomButton;
  /**
   * Callback which returns a custom React Element to use as the
   * closeComponent. IUserStoryItem is passed as an arg.
   */
  renderCloseComponent?: RenderCustomButton;
  /**
   * Callback which returns a custom React Element to use as the textComponent
   * next to the small avatar on the story item page. IUserStoryItem and
   * username are passed as args.
   */
  renderTextComponent?: RenderCustomText;
  /** Display username below avatars in FlatList */
  showAvatarText?: boolean;
  /** Username text style below the avatar */
  avatarTextStyle?: TextStyle;
}
