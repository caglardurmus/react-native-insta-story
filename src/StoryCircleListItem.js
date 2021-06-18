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
        const {item, unPressedBorderColor, pressedBorderColor, avatarSize} = this.props;
        const {isPressed} = this.state;
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => this._handleItemPress(item)}
                    style={[
                        styles.avatarWrapper,
                        {
                            height: avatarSize ? avatarSize + 4 : 64,
                            width: avatarSize ? avatarSize + 4 : 64,
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
                            height: avatarSize ?? 60,
                            width: avatarSize ?? 60,
                            borderRadius: 100,
                        }}
                        source={{uri: item.user_image}}
                        defaultSource={Platform.OS === 'ios' ? DEFAULT_AVATAR : null}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

export default StoryCircleListItem;

const
    styles = StyleSheet.create({
        container: {
            marginVertical: 5,
            marginHorizontal: 8
        },
        unPressedAvatar: {
            borderColor: 'red'
        },
        pressedAvatar: {
            borderColor: 'grey'
        },
        avatarWrapper: {
            borderWidth: 2,
            justifyContent: "center",
            alignItems: "center",
            borderColor: 'red',
            borderRadius: 100,
            height: 64,
            width: 64
        },
        avatar: {
            height: 60,
            width: 60,
            borderRadius: 100,
        },
        itemText: {
            textAlign: "center",
            fontSize: 9
        }
    });
