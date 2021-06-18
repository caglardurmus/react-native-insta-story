import React, {Component, Fragment, useRef, useState} from "react";
import {Dimensions, View} from "react-native";
import Modal from "react-native-modalbox";
import CubeNavigationHorizontal from "./CubeNavigationHorizontal";
import StoryListItem from "./StoryListItem";
import StoryCircleListView from "./StoryCircleListView";
import {isNullOrWhitespace} from "./helpers/ValidationHelpers";
import type {IUserStory} from "./interfaces/IUserStory";


type Props = {
    data: IUserStory[],
    style?: any,
    unPressedBorderColor?: string,
    pressedBorderColor?: string,
    onClose?: function,
    onStart?: function,
    duration?: number,
    customSwipeUpComponent?: any
};

export const Story = (props: Props) => {
    const {
        data,
        unPressedBorderColor,
        pressedBorderColor,
        style,
        onClose,
        duration,
        customSwipeUpComponent
    } = props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedData, setSelectedData] = useState([]);
    const cube = useRef();

    // Component Functions
    const _handleStoryItemPress = (item, index) => {
        const newData = data.slice(index);
        setCurrentPage(0);
        setSelectedData(newData);
        setIsModalOpen(true);
    };

    function onStoryFinish(state) {
        if (!isNullOrWhitespace(state)) {
            if (state == "next") {
                const newPage = currentPage + 1;
                if (newPage < selectedData.length) {
                    setCurrentPage(newPage);
                    cube?.current?.scrollTo(newPage);
                } else {

                    setIsModalOpen(false);
                    setCurrentPage(0);
                    if (onClose) {
                        onClose();
                    }
                }
            } else if (state == "previous") {
                const newPage = currentPage - 1;
                if (newPage < 0) {
                    setIsModalOpen(false);
                    setCurrentPage(0);
                } else {
                    setCurrentPage(newPage);
                    cube?.current?.scrollTo(newPage);
                }
            }
        }
    }

    return (
        <Fragment>
            <View style={style}>
                <StoryCircleListView
                    handleStoryItemPress={_handleStoryItemPress}
                    data={data}
                    unPressedBorderColor={unPressedBorderColor}
                    pressedBorderColor={pressedBorderColor}
                />
            </View>
            <Modal
                style={{
                    flex: 1,
                    height: Dimensions.get("window").height,
                    width: Dimensions.get("window").width
                }}
                isOpen={isModalOpen}
                onClosed={() => setIsModalOpen(false)}
                position="center"
                swipeToClose
                swipeArea={250}
                backButtonClose
                coverScreen={true}
            >
                <CubeNavigationHorizontal
                    ref={cube}
                    callBackAfterSwipe={(x) => {
                        if (x != currentPage) {
                            setCurrentPage(parseInt(x));
                        }
                    }}
                >
                    {selectedData.map((x, i) => {
                        return (<StoryListItem duration={duration * 1000}
                                               key={i}
                                               profileName={x.user_name}
                                               profileImage={x.user_image}
                                               stories={x.stories}
                                               currentPage={currentPage}
                                               onFinish={onStoryFinish}
                                               customSwipeUpComponent={customSwipeUpComponent}
                                               onClosePress={() => {
                                                   setIsModalOpen(false);
                                                   if (onClose) {
                                                       onClose();
                                                   }
                                               }}
                                               index={i}/>)
                    })}
                </CubeNavigationHorizontal>
            </Modal>
        </Fragment>
    );
};
export default Story;
