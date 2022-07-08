import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  useColorScheme,
  View,
  Text
} from 'react-native';
import InstaStory from 'react-native-insta-story';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? "#000" : "#fff",
  };

  const data = [
    {
      user_id: 1,
      user_image: 'https://pbs.twimg.com/profile_images/1222140802475773952/61OmyINj.jpg',
      user_name: "Ahmet Çağlar Durmuş",
      stories: [
        {
          story_id: 1,
          story_image: "https://image.freepik.com/free-vector/universe-mobile-wallpaper-with-planets_79603-600.jpg",
          swipeText: 'Custom swipe text for this story',
          onPress: () => console.log('story 1 swiped'),
        },
        {
          story_id: 2,
          story_image: "https://image.freepik.com/free-vector/mobile-wallpaper-with-fluid-shapes_79603-601.jpg",
        }]
    },
    {
      user_id: 2,
      user_image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&w=1000&q=80',
      user_name: "Test User",
      stories: [
        {
          story_id: 1,
          story_video: "https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_10mb.mp4",
          swipeText: 'Custom swipe text for this story',
          onPress: () => console.log('story 1 swiped'),
        }]
    }];


  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <InstaStory data={data}
        duration={10}
        onStart={item => console.log(item)}
        onClose={item => console.log('close: ', item)}
        customSwipeUpComponent={<View>
          <Text>Swipe</Text>
        </View>}
        style={{ marginTop: 30 }} />

    </SafeAreaView>
  );
};

export default App;
