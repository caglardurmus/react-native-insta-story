import React, {useState, useEffect} from "react";
import {View, Image, TouchableOpacity, Text, StyleSheet, Platform} from "react-native";
import {usePrevious} from "./helpers/StateHelpers";

import DEFAULT_AVATAR from "./assets/images/no_avatar.png";

const StoryCircleListItem = (props) => {

    const {
        item,
        unPressedBorderColor,
        pressedBorderColor,
        avatarSize,
        showText,
        textStyle
    } = props;

    const [isPressed, setIsPressed] = useState(props?.item?.seen);

    const prevSeen = usePrevious(props?.item?.seen);

    useEffect(() => {
        if (prevSeen != props?.item?.seen) {
            setIsPressed(props?.item?.seen);
        }

    }, [props?.item?.seen]);

    const _handleItemPress = item => {
        const {handleStoryItemPress} = props;

        if (handleStoryItemPress) handleStoryItemPress(item);

        setIsPressed(true);
    };

    const size = avatarSize ?? 140;
    const width = avatarSize ?? 105

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => _handleItemPress(item)}
                style={[
                    styles.avatarWrapper,
                    {
                        height: size + 4,
                        width: width + 4,
                    },
                    // !isPressed
                    //     ? {
                    //         borderColor: unPressedBorderColor
                    //             ? unPressedBorderColor
                    //             : 'red'
                    //     }
                    //     : {
                    //         borderColor: pressedBorderColor
                    //             ? pressedBorderColor
                    //             : 'grey'
                    //     }
                ]}
            >
                <Image
                    style={{
                        height: size,
                        width: width,
                        borderRadius: 10,
                    }}
                    source={{uri: item.user_image}}
                    defaultSource={Platform.OS === 'ios' ? DEFAULT_AVATAR : null}
                />
            </TouchableOpacity>
            {/* {showText &&
                <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                        width: size + 4,
                        ...styles.text,
                        ...textStyle
                    }}>{item.user_name}</Text>} */}
        </View>
    );
}

export default StoryCircleListItem;

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        marginRight: 10
    },
    avatarWrapper: {
        // borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        // borderColor: 'red',
        borderRadius: 10,
        height: 140,
        width: 105
    },
    text: {
        // marginTop: 3,
        textAlign: "center",
        alignItems: "center",
        fontSize: 11
    }
});
