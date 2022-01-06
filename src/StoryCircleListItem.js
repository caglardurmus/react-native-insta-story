import React, {Component} from "react";
import {View, Image, TouchableOpacity, Text, StyleSheet, Platform} from "react-native";

// Constants
import DEFAULT_AVATAR from "./assets/images/no_avatar.png";

// Components
class StoryCircleListItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPressed: this.props?.item?.seen
        };
    }

    // Component Functions
    _handleItemPress = item => {
        const {handleStoryItemPress} = this.props;

        if (handleStoryItemPress) handleStoryItemPress(item);

        this.setState({isPressed: true});
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.item.seen != this.props.item.seen) {
            this.setState({isPressed: this.props.item.seen});
        }
    }

    render() {
        const {
            item,
            unPressedBorderColor,
            pressedBorderColor,
            avatarSize,
            showText,
            textStyle
        } = this.props;

        const size = avatarSize ?? 60;

        const {isPressed} = this.state;

        return (
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => this._handleItemPress(item)}
                    style={[
                        styles.avatarWrapper,
                        {
                            height: size + 4,
                            width: size + 4,
                        },
                        !isPressed
                            ? {
                                borderColor: unPressedBorderColor
                                    ? unPressedBorderColor
                                    : 'red'
                            }
                            : {
                                borderColor: pressedBorderColor
                                    ? pressedBorderColor
                                    : 'grey'
                            }
                    ]}
                >
                    <Image
                        style={{
                            height: size,
                            width: size,
                            borderRadius: 100,
                        }}
                        source={{uri: item.user_image}}
                        defaultSource={Platform.OS === 'ios' ? DEFAULT_AVATAR : null}
                    />
                </TouchableOpacity>
                {showText &&
                    <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={{
                            width: size + 4,
                            ...styles.text,
                            ...textStyle
                        }}>{item.user_name}</Text>}
            </View>
        );
    }
}

export default StoryCircleListItem;

const
    styles = StyleSheet.create({
        container: {
            marginVertical: 5,
            marginRight: 10,
            backgroundColor: 'blue'
        },
        avatarWrapper: {
            borderWidth: 2,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            borderColor: 'red',
            borderRadius: 100,
            height: 64,
            width: 64
        },
        text: {
            marginTop: 3,
            textAlign: "center",
            alignItems: "center",
            fontSize: 11
        }
    });
