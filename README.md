# react-native-insta-story

<p align="center">
<img src="./images/example.gif" height="500" />
</p>

## Install

#### 1. Step

```javascript
npm install react-native-insta-story --save
```

or

```javascript
yarn add react-native-insta-story
```

#### 2. Step

```javascript
cd ios && pod install
```

#### 3. Step (optional – for video stories)

To show video in stories, install [react-native-video](https://github.com/TheWidlarzGroup/react-native-video) in your app and link it (e.g. run `pod install` again). Story items with `story_video` set will then be rendered as video; others continue to use `story_image`.

```javascript
npm install react-native-video --save
```

## Import

```javascript
import InstaStory from 'react-native-insta-story';
```

TypeScript types and interfaces (`IUserStory`, `IUserStoryItem`, etc.) are exported from the package.

## Props

| Name                       | Description                                                                      | Type          | Default Value |
| :------------------------- | :------------------------------------------------------------------------------- | :------------ | :-----------: |
| data                       | Array of user stories (`IUserStory[]`). See exported TypeScript interfaces.      | IUserStory[]  |               |
| unPressedBorderColor       | Unpressed border color of profile circle                                         | ColorValue    |      red      |
| pressedBorderColor         | Pressed border color of profile circle                                           | ColorValue    |     grey      |
| unPressedAvatarTextColor   | Unpressed avatar text color                                                      | ColorValue    |      red      |
| pressedAvatarTextColor     | Pressed avatar text color                                                        | ColorValue    |     grey      |
| onStorySeen                | Called when a story is viewed (receives `IUserSingleStory`).                     | function      |     null      |
| onClose                    | Called when modal is closed (receives the current user `IUserStory`).            | function      |     null      |
| onStart                    | Called when a story is opened (receives `IUserStory`).                           | function      |     null      |
| duration                   | Per-story duration in seconds                                                    | number        |      10       |
| swipeText                  | Text for the swipe-up hint                                                       | string        |   Swipe Up    |
| renderSwipeUpComponent     | Render a custom swipe-up component                                               | function      |               |
| renderCloseComponent       | Render a custom close button                                                     | function      |               |
| renderTextComponent        | Render custom text next to the avatar on the story screen                        | function      |               |
| avatarSize                 | Size of the avatar circle in the list                                            | number        |      60       |
| showAvatarText             | Show or hide username below avatars                                              | boolean       |     true      |
| avatarTextStyle            | Style for the username text below avatars                                        | TextStyle     |               |
| avatarImageStyle           | Style for the avatar image in the list                                           | ImageStyle    |               |
| avatarWrapperStyle         | Style for each avatar wrapper in the list                                        | ViewStyle     |               |
| avatarFlatListProps        | Props for the avatar FlatList (`data`, `renderItem`, `keyExtractor` are omitted) | FlatListProps |               |
| loadedAnimationBarStyle    | Style for the progress bar when loaded                                           | ViewStyle     |               |
| unloadedAnimationBarStyle  | Style for the progress bar when not yet loaded                                   | ViewStyle     |               |
| animationBarContainerStyle | Style for the container of the progress bars                                     | ViewStyle     |               |
| storyUserContainerStyle    | Style for the header (user + close button) on the story screen                   | ViewStyle     |               |
| storyImageStyle            | Style for the story image                                                        | ImageStyle    |               |
| storyAvatarImageStyle      | Style for the small avatar on the story screen                                   | ImageStyle    |               |
| storyContainerStyle        | Style for the story content container                                            | ViewStyle     |               |
| style                      | Style for the root container (avatar list wrapper)                               | ViewStyle     |               |

## Usage

### Basic

```javascript
import InstaStory from 'react-native-insta-story';

const data = [
  {
    user_id: 1,
    user_image:
      'https://pbs.twimg.com/profile_images/1222140802475773952/61OmyINj.jpg',
    user_name: 'User 1',
    stories: [
      {
        story_id: 1,
        story_image:
          'https://image.freepik.com/free-vector/universe-mobile-wallpaper-with-planets_79603-600.jpg',
        swipeText: 'Custom swipe text for this story',
        onPress: () => console.log('story 1 swiped'),
      },
      {
        story_id: 2,
        story_image:
          'https://image.freepik.com/free-vector/mobile-wallpaper-with-fluid-shapes_79603-601.jpg',
        // Optional: set story_video to show a video instead of an image (requires react-native-video)
        // story_video: 'https://example.com/short-video.mp4',
      },
    ],
  },
  {
    user_id: 2,
    user_image:
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80',
    user_name: 'Test User',
    stories: [
      {
        story_id: 1,
        story_image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjORKvjcbMRGYPR3QIs3MofoWkD4wHzRd_eg&usqp=CAU',
        swipeText: 'Custom swipe text for this story',
        onPress: () => console.log('story 1 swiped'),
      },
      {
        story_id: 2,
        story_image:
          'https://files.oyebesmartest.com/uploads/preview/vivo-u20-mobile-wallpaper-full-hd-(1)qm6qyz9v60.jpg',
        swipeText: 'Custom swipe text for this story',
        onPress: () => console.log('story 2 swiped'),
      },
    ],
  },
];

<InstaStory data={data} duration={10} />;
```

### Custom components

The library exports TypeScript interfaces (`IUserStory`, `IUserStoryItem`, `IUserSingleStory`, etc.) for typing your data and render props.

- **renderSwipeUpComponent** and **renderCloseComponent** receive `{ item, onPress }`: `item` is the current story item (`IUserStoryItem`), and `onPress` closes the modal and triggers `IUserStoryItem.onPress` if defined. Use `onPress` for your close (or other) buttons.
- **renderTextComponent** receives `{ item, profileName }`: the current story item and the display name of the user.

```javascript
const data = [...sameDataAsBasicExampleAbove];

const [seenStories, setSeenStories] = useState(new Set());

const updateSeenStories = ({ story: { story_id } }) => {
  setSeenStories((prevSet) => {
    const next = new Set(prevSet);
    next.add(story_id);
    return next;
  });
};

const handleSeenStories = async (item) => {
  console.log('Closed story for user:', item);
  const storyIds = Array.from(seenStories);
  if (storyIds.length > 0) {
    await fetch('myApi', {
      method: 'POST',
      body: JSON.stringify({ storyIds }),
    });
    setSeenStories(new Set());
  }
};

<InstaStory
  data={data}
  duration={10}
  onStart={(item) => console.log(item)}
  onClose={handleSeenStories}
  onStorySeen={updateSeenStories}
  renderCloseComponent={({ item, onPress }) => (
    <View style={{ flexDirection: 'row' }}>
      <Button onPress={shareStory}>Share</Button>
      <Button onPress={onPress}>X</Button>
    </View>
  )}
  renderTextComponent={({ item, profileName }) => (
    <View>
      <Text>{profileName}</Text>
      <Text>{item.customProps?.yourCustomProp}</Text>
    </View>
  )}
  style={{ marginTop: 30 }}
/>;
```
