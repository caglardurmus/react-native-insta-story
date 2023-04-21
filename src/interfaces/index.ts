import {
  ColorValue,
  FlatListProps,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from 'react-native';

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

/** User with one story representing the current story on screen */
export interface IUserSingleStory extends Omit<IUserStory, 'stories'> {
  story: IUserStoryItem;
}

export type CircleListViewFlatListProps = Omit<
  FlatListProps<any>,
  'renderItem' | 'data' | 'keyExtractor'
>;

export interface CustomButtonRenderProps<T = Record<string, any>> {
  /**
   * Function that closes the story modal and calls `IUserStoryItem.onPress`
   */
  onPress: (props?: any) => any;
  /** The current story item */
  item: IUserStoryItem<T>;
}

export type RenderCustomButton<T = Record<string, any>> = (
  props: CustomButtonRenderProps<T>,
) => React.ReactNode;

export interface TextRenderProps<T = Record<string, any>> {
  /** Equivalent to `IUserStory.user_name` */
  profileName: string;
  /** The current item */
  item: IUserStoryItem<T>;
}

export type RenderCustomText = (props: TextRenderProps) => React.ReactNode;

interface SharedCircleListProps {
  handleStoryItemPress: (item: IUserStory, index?: number) => void;
  /** The color of the avatar border when unseen */
  unPressedBorderColor?: ColorValue;
  /** The color of the avatar border when seen */
  pressedBorderColor?: ColorValue;
  /** The color of the avatar text when unseen */
  unPressedAvatarTextColor?: TextStyle['color'];
  /** The color of the avatar text when seen */
  pressedAvatarTextColor?: TextStyle['color'];
  /** A custom size for the avatar rendered in the FlatList */
  avatarSize?: number;
  /** Display username below avatars in FlatList */
  showText?: boolean;
  /** Username text style below the avatar */
  avatarTextStyle?: TextStyle;
  /** Custom styles for the avatar image */
  avatarImageStyle?: ImageStyle;
  /** Custom styles for each individual avatar wrapper */
  avatarWrapperStyle?: ViewStyle;
}

export interface StoryCircleListViewProps extends SharedCircleListProps {
  data: IUserStory[];
  /**
   * Custom props for the avatar FlatList.
   *
   * Omitted props:
   * - `data`
   * - `renderItem`
   * - `keyExtractor`
   */
  avatarFlatListProps?: CircleListViewFlatListProps;
}

export interface StoryCircleListItemProps extends SharedCircleListProps {
  item: IUserStory;
}

// TODO: add JSDoc comments where necessary
export interface StoryListItemProps {
  /** Index of story  */
  index: number;
  key: number;
  /** ID of the user - IUserStory.user_id */
  userId: number;
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
  /**
   * Function which will get called every time a story is seen. Will be called
   * every time the user swipes backwards and forwards to that screen.
   */
  onStorySeen?: (userStory: IUserSingleStory) => any;
  /** An array of stories from one user */
  stories: IUserStoryItem[];
  currentPage: number;
  /** Custom style for the animation bar when it is loading */
  loadedAnimationBarStyle?: ViewStyle;
  /** Custom styles for the animation bar when unloaded */
  unloadedAnimationBarStyle?: ViewStyle;
  /** Custom styles for the animation bars container */
  animationBarContainerStyle?: ViewStyle;
  /** Custom styles for the user and close button container */
  storyUserContainerStyle?: ViewStyle;
  /** Custom styles for the main story item image */
  storyImageStyle?: ImageStyle;
  /** Custom styles for the user avatar on the story item */
  storyAvatarImageStyle?: ImageStyle;
  /** Custom styles for the main story item container */
  storyContainerStyle?: ViewStyle;
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
  /** The color of the avatar text when unseen */
  unPressedAvatarTextColor?: TextStyle['color'];
  /** The color of the avatar text when seen */
  pressedAvatarTextColor?: TextStyle['color'];
  /** Called when story item close button is pressed */
  onClose?: (props?: IUserStory) => any;
  /** Called when story item is loaded */
  onStart?: (props?: IUserStory) => any;
  /**
   * Function which will get called every time a story is seen. Will be called
   * every time the user swipes backwards and forwards to that screen.
   */
  onStorySeen?: (userStory: IUserSingleStory) => any;
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
  /** Custom styles for the avatar image */
  avatarImageStyle?: ImageStyle;
  /** Custom styles for each individual avatar wrapper */
  avatarWrapperStyle?: ViewStyle;
  /**
   * Custom props for the avatar FlatList.
   *
   * Omitted props:
   * - `data`
   * - `renderItem`
   * - `keyExtractor`
   */
  avatarFlatListProps?: CircleListViewFlatListProps;
  /** Custom style for the animation bar when it is loading */
  loadedAnimationBarStyle?: ViewStyle;
  /** Custom styles for the animation bar when unloaded */
  unloadedAnimationBarStyle?: ViewStyle;
  /** Custom styles for the animation bars container */
  animationBarContainerStyle?: ViewStyle;
  /** Custom styles for the user and close button container */
  storyUserContainerStyle?: ViewStyle;
  /** Custom styles for the main story item image */
  storyImageStyle?: ImageStyle;
  /** Custom styles for the user avatar on the story item */
  storyAvatarImageStyle?: ImageStyle;
  /** Custom styles for the main story item container */
  storyContainerStyle?: ViewStyle;
}
