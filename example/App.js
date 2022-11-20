import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import InstaStory from "react-native-insta-story";

const { width, height } = Dimensions.get("window");

export default function App() {
  function createData() {
    const array = [];

    const userCount = 10;
    const userStoryCount = 15;

    for (let i = 1; i <= userCount; i++) {
      const storyArray = [];
      for (let k = 1; k <= userStoryCount; k++) {
        storyArray.push({
          id: i,
          media: {
            type: "image",
            url: "https://picsum.photos/500/800?random=" + Math.random(),
          },
          swipeText: "Custom swipe text for this story",
          onPress: () => console.log(`story ${i} swiped`),
        });
      }

      array.push({
        id: i,
        profilePic: "https://picsum.photos/200/300?random=" + Math.random(),
        username: "Test User " + i,
        vibes: storyArray,
      });
    }
    array.push({
      id: 11,
      profilePic: "https://picsum.photos/200/300?random=" + Math.random(),
      username: "Wasi Ayub",
      vibes: [
        {
          id: 1,
          media: {
            type: "image",
            url: "https://firebasestorage.googleapis.com/v0/b/recgriddev.appspot.com/o/62661d77-f98b-4e6f-8acb-e5168a829a6f.MP4?alt=media&token=ea3f967d-1f1d-45ed-b9bd-e449c4572c72",
          },
          swipeText: "Custom swipe text for this story",
          onPress: () => console.log(`story ${i} swiped`),
        },
      ],
    });
    return array;
  }

  return (
    <View style={styles.container}>
      {alert(`createData(): ${JSON.stringify(createData()[0])}`)}
      <StatusBar style="auto" />
      <InstaStory
        data={createData()}
        duration={10}
        customSwipeUpComponent={
          <View>
            <Text>Swipe</Text>
          </View>
        }
        style={{ marginTop: 30 }}
        avatarSize={{
          width: width / 3 - 20,
          height: height / 4,
          borderRadius: 10,
        }}
        numColumns={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
