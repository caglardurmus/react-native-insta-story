"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryListItem = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_swipe_gestures_1 = __importDefault(require("react-native-swipe-gestures"));
const helpers_1 = require("./helpers");
const { width, height } = react_native_1.Dimensions.get('window');
const StoryListItem = ({ index, key, profileImage, profileName, duration, customCloseComponent, customSwipeUpComponent, onFinish, onClosePress, stories, currentPage, ...props }) => {
    const [load, setLoad] = (0, react_1.useState)(true);
    const [pressed, setPressed] = (0, react_1.useState)(false);
    const [content, setContent] = (0, react_1.useState)(stories.map((x) => ({
        ...x,
        finish: 0,
    })));
    const [current, setCurrent] = (0, react_1.useState)(0);
    const progress = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const prevCurrentPage = (0, helpers_1.usePrevious)(currentPage);
    (0, react_1.useEffect)(() => {
        let isPrevious = !!prevCurrentPage && prevCurrentPage > currentPage;
        if (isPrevious) {
            setCurrent(content.length - 1);
        }
        else {
            setCurrent(0);
        }
        let data = [...content];
        data.map((x, i) => {
            if (isPrevious) {
                x.finish = 1;
                if (i == content.length - 1) {
                    x.finish = 0;
                }
            }
            else {
                x.finish = 0;
            }
        });
        setContent(data);
        start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);
    const prevCurrent = (0, helpers_1.usePrevious)(current);
    (0, react_1.useEffect)(() => {
        if (!(0, helpers_1.isNullOrWhitespace)(prevCurrent)) {
            if (prevCurrent) {
                if (current > prevCurrent &&
                    content[current - 1].story_image == content[current].story_image) {
                    start();
                }
                else if (current < prevCurrent &&
                    content[current + 1].story_image == content[current].story_image) {
                    start();
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current]);
    function start() {
        setLoad(false);
        progress.setValue(0);
        startAnimation();
    }
    function startAnimation() {
        react_native_1.Animated.timing(progress, {
            toValue: 1,
            duration: duration,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                next();
            }
        });
    }
    function onSwipeUp(_props) {
        if (onClosePress) {
            onClosePress();
        }
        if (content[current].onPress) {
            content[current].onPress?.();
        }
    }
    function onSwipeDown(_props) {
        onClosePress();
    }
    const config = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80,
    };
    function next() {
        // check if the next content is not empty
        setLoad(true);
        if (current !== content.length - 1) {
            let data = [...content];
            data[current].finish = 1;
            setContent(data);
            setCurrent(current + 1);
            progress.setValue(0);
        }
        else {
            // the next content is empty
            close('next');
        }
    }
    function previous() {
        // checking if the previous content is not empty
        setLoad(true);
        if (current - 1 >= 0) {
            let data = [...content];
            data[current].finish = 0;
            setContent(data);
            setCurrent(current - 1);
            progress.setValue(0);
        }
        else {
            // the previous content is empty
            close('previous');
        }
    }
    function close(state) {
        let data = [...content];
        data.map((x) => (x.finish = 0));
        setContent(data);
        progress.setValue(0);
        if (currentPage == index) {
            if (onFinish) {
                onFinish(state);
            }
        }
    }
    const swipeText = content?.[current]?.swipeText || props.swipeText || 'Swipe Up';
    return (<react_native_swipe_gestures_1.default key={key} onSwipeUp={onSwipeUp} onSwipeDown={onSwipeDown} config={config} style={{
            flex: 1,
            backgroundColor: 'black',
        }}>
      <react_native_1.SafeAreaView>
        <react_native_1.View style={styles.backgroundContainer}>
          <react_native_1.Image onLoadEnd={() => start()} source={{ uri: content[current].story_image }} style={styles.image}/>
          {load && (<react_native_1.View style={styles.spinnerContainer}>
              <react_native_1.ActivityIndicator size="large" color={'white'}/>
            </react_native_1.View>)}
        </react_native_1.View>
      </react_native_1.SafeAreaView>
      <react_native_1.View style={{ flexDirection: 'column', flex: 1 }}>
        <react_native_1.View style={styles.animationBarContainer}>
          {content.map((index, key) => {
            return (<react_native_1.View key={key} style={styles.animationBackground}>
                <react_native_1.Animated.View style={{
                    flex: current == key ? progress : content[key].finish,
                    height: 2,
                    backgroundColor: 'white',
                }}/>
              </react_native_1.View>);
        })}
        </react_native_1.View>
        <react_native_1.View style={styles.userContainer}>
          <react_native_1.View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <react_native_1.Image style={styles.avatarImage} source={{ uri: profileImage }}/>
            <react_native_1.Text style={styles.avatarText}>{profileName}</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.TouchableOpacity onPress={() => {
            if (onClosePress) {
                onClosePress();
            }
        }}>
            <react_native_1.View style={styles.closeIconContainer}>
              {customCloseComponent ? (customCloseComponent) : (<react_native_1.Text style={{ color: 'white' }}>X</react_native_1.Text>)}
            </react_native_1.View>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
        <react_native_1.View style={styles.pressContainer}>
          <react_native_1.TouchableWithoutFeedback onPressIn={() => progress.stopAnimation()} onLongPress={() => setPressed(true)} onPressOut={() => {
            setPressed(false);
            startAnimation();
        }} onPress={() => {
            if (!pressed && !load) {
                previous();
            }
        }}>
            <react_native_1.View style={{ flex: 1 }}/>
          </react_native_1.TouchableWithoutFeedback>
          <react_native_1.TouchableWithoutFeedback onPressIn={() => progress.stopAnimation()} onLongPress={() => setPressed(true)} onPressOut={() => {
            setPressed(false);
            startAnimation();
        }} onPress={() => {
            if (!pressed && !load) {
                next();
            }
        }}>
            <react_native_1.View style={{ flex: 1 }}/>
          </react_native_1.TouchableWithoutFeedback>
        </react_native_1.View>
      </react_native_1.View>
      {content[current].onPress && (<react_native_1.TouchableOpacity activeOpacity={1} onPress={onSwipeUp} style={styles.swipeUpBtn}>
          {customSwipeUpComponent ? (customSwipeUpComponent) : (<>
              <react_native_1.Text style={{ color: 'white', marginTop: 5 }}></react_native_1.Text>
              <react_native_1.Text style={{ color: 'white', marginTop: 5 }}>{swipeText}</react_native_1.Text>
            </>)}
        </react_native_1.TouchableOpacity>)}
    </react_native_swipe_gestures_1.default>);
};
exports.StoryListItem = StoryListItem;
exports.default = exports.StoryListItem;
exports.StoryListItem.defaultProps = {
    duration: 10000,
};
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    image: {
        width: width,
        height: height,
        resizeMode: 'cover',
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    spinnerContainer: {
        zIndex: -100,
        position: 'absolute',
        justifyContent: 'center',
        backgroundColor: 'black',
        alignSelf: 'center',
        width: width,
        height: height,
    },
    animationBarContainer: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    animationBackground: {
        height: 2,
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(117, 117, 117, 0.5)',
        marginHorizontal: 2,
    },
    userContainer: {
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    avatarImage: {
        height: 30,
        width: 30,
        borderRadius: 100,
    },
    avatarText: {
        fontWeight: 'bold',
        color: 'white',
        paddingLeft: 10,
    },
    closeIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        paddingHorizontal: 15,
    },
    pressContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    swipeUpBtn: {
        position: 'absolute',
        right: 0,
        left: 0,
        alignItems: 'center',
        bottom: react_native_1.Platform.OS == 'ios' ? 20 : 50,
    },
});
