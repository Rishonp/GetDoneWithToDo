import React, { useRef, useState, useEffect, useContext } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, Alert, PanResponder, Animated } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Users from "../utils/Users";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Image } from 'react-native';
import { MainTasks } from '../utils/Users';
import { MainTaskWrapperWithAddedByName } from '../utils/Users';
import * as Common from "../utils/Common"
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../utils/config';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { usernotitoken } from '../utils/Users';
import { handleNotification } from '../utils/Common'; '';
import { getEventIdFromDatabase } from '../screens/ModifyTaskScreen'; // Import the function to get event ID
import { removeEventIdFromDatabase } from '../screens/ModifyTaskScreen'; // Import the function to remove event ID

// below 3 are for swipe left and right functionality 
import { Dimensions } from 'react-native';
//import { Gesture, GestureDetector } from 'react-native-gesture-handler';
//import Animated, { useSharedValue, useAnimatedStyle, runOnJS, withSpring } from 'react-native-reanimated';

//import CreateTaskScreen from './CreateTaskScreen';
//import ModifyTaskScreen from './ModifyTaskScreen';
//import UserSettingsScreen from './UserSettingsScreen';


function returnHrsDays(startDateTime, endDateTime) {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  const now = new Date();
  let num;
  let text_num;
  let days = daysRelativeToDue(startDateTime, endDateTime).days;
  let hours = daysRelativeToDue(startDateTime, endDateTime).hours;
  console.log("num Day hours ", days, hours);
  if (days !== "") {
    return "days"
  } else {
    if (hours !== "") {
      return "hrs"
    }

  }
  return ""
}


function daysRelativeToDue(startDateTime, endDateTime) {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  const now = new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid startDateTime or endDateTime');
  }
  if (end < start) {
    throw new Error('endDateTime must be >= startDateTime');
  }

  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  if (now > end) {
    let a = Math.floor((now - end) / MS_PER_DAY);
    if (a === 0) {
      return { status: 'Now', days: "", hours: "", color: Common.getColor('amber'), textColor: Common.getColor('amberText') };
    } else {
      if (a >= 2) {
        return { status: 'Past', days: a, hours: a * 24, color: Common.getColor('red'), textColor: Common.getColor('redText') };
      } else {
        return { status: 'Past', days: "", hours: a * 24, color: Common.getColor('red'), textColor: Common.getColor('redText') };
      }



    }
  } else {
    let b = Math.ceil((end - now) / MS_PER_DAY);
    if (b === 0) {
      return { status: 'Now', days: "", hours: "", color: Common.getColor('amber'), textColor: Common.getColor('amberText') };
    } else {
      if (b >= 2) {
        return { status: 'Due', days: b, hours: b * 24, color: Common.getColor('green'), textColor: Common.getColor('greenText') };
      } else {
        return { status: 'Now', days: "", hours: b * 24, color: Common.getColor('green'), textColor: Common.getColor('greenText') };
      }
    }



    return { status: 'due-in', days: b == 0 ? "" : b };
  }
}

const styles = StyleSheet.create({
  watermarkLogo: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -50 }, // Half of width to center
      { translateY: -50 }  // Half of height to center
    ],
    width: 100,
    height: 100,
    opacity: 0.1, // Very subtle - 10% opacity
    zIndex: 0, // Behind all other content
  },
  centerIt: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  rowLeftAligned: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    marginTop: 1,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 12,
  },
  deleteButton: {
    backgroundColor: '#FFF8E1',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20, // Rounded corners
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },

  doneButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20, // Rounded corners
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20, // Rounded corners
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',

  },

  buttonTextBlack: {
    color: 'black', // Black text
    fontSize: 14,
    fontWeight: '600',
  },

  buttonText: {
    color: '#fff', // White text
    fontSize: 14,
    fontWeight: '600',
  },
  smallBlackText: {
    color: 'black', // Black text
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-end', // Align to bottom of the container
    textAlignVertical: 'bottom', // For Android
  },
  verySmallWhiteText: {
    color: 'white', // Black text
    fontSize: 9,
    fontWeight: '400',
    alignSelf: 'center', // Align to center of the container
    textAlignVertical: 'center', // For Android
    fontStyle: 'italic', // Italic text
  },
  smallText: {
    //color: 'white', // Black text
    fontSize: 12,
    fontWeight: '400',
    alignSelf: 'center', // Align to center of the container
    textAlignVertical: 'center', // For Android
    fontStyle: 'italic', // Italic text
  },


  smallBlackTextCentre: {
    color: 'black', // Black text
    fontSize: 15,
    fontWeight: '600',
    alignSelf: 'center', // Align to center of the container
    textAlignVertical: 'bottom', // For Android
  },


  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    marginVertical: 5,
    shadowColor: '#000', // ios
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3, // andriod
    borderLeftWidth: 3,
    //borderLeftColor: '#4CAF50', // default green
    width: '100%',
  },
  cardOuter: {
    //backgroundColor: '#fff',
    //borderRadius: 16,
    padding: 1,
    marginVertical: 0,
    //shadowColor: '#000', // ios
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.08,
    //shadowRadius: 4,
    //elevation: 3, // andriod
    //borderLeftWidth: 3,
    //borderLeftColor: '#4CAF50', // default green
    width: '100%',
  },

  flagContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },

  cardLeftRight: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 1,
    marginVertical: 0,
    shadowColor: '#000', // ios
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 1, // andriod
    //borderLeftWidth: 1,
    //borderLeftColor: '#4CAF50', // default green
    width: '100%',
    flex: 1,
    minHeight: 50, // Minimum height for the card
    justifyContent: 'center', // Add this to vertically center content
    alignItems: 'center',
  },

  cardRed: {
    borderLeftColor: '#E53935', // red for overdue
    backgroundColor: '#FDECEA',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardTitleBitSmall: {
    fontSize: 20,
    fontWeight: '400',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center', // Center the text

  },

  cardTitleNoMargin: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 0,
  },

  cardDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardDateBold: {
    fontSize: 14,
    color: 'black',
    marginBottom: 4,
    fontWeight: 'bold',
  },

  cardDateSmall: {
    fontSize: 11,
    color: 'black',
    marginBottom: 0,
    fontWeight: 'normal',
  },

  titleBorder: {
    fontSize: 18,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: "black",
    fontWeight: 'bold'
  },
  titleBorderRed: {
    fontSize: 18,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: "black",
    fontWeight: 'bold',
    backgroundColor: '#ffe5e5', // Very light red
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'

  },

  titleSupport: {
    fontSize: 16,
    //fontFamily: 'Poppins-BoldItalic', // use the actual italic variant
    fontStyle: 'italic',
    //fontWeight: 'bold',
  },

  date: {
    fontSize: 14,
    color: '#555',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  topSection: {
    flex: .5, // 40%
    //backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleSection: {
    flex: 9.5, // 80%
    //backgroundColor: '#d6e7eaff',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    //borderWidth: 1,          // Thickness of the border
    //borderColor: 'black',    // Border color
    //borderRadius: 5,         // Optional: rounded corners
    //padding: 2,             // Optional: space inside the border
    //margin: 2,              // Optional: space outside the border
    width: '100%',
  },
  bottomSection: {
    flex: 0, // 10%
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middle_top: {
    flex: 7, // 60%
    //backgroundColor: '#d6e7eaff',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    //borderWidth: 1,          // Thickness of the border
    //borderColor: 'black',    // Border color
    //borderRadius: 5,         // Optional: rounded corners
    //padding: 2,             // Optional: space inside the border
    //margin: 2,              // Optional: space outside the border
    width: '100%',
  },
  middle_bottom: {
    flex: 3, // 40%
    //backgroundColor: '#d6e7eaff',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    //borderWidth: 1,          // Thickness of the border
    //borderColor: 'black',    // Border color
    //borderRadius: 5,         // Optional: rounded corners
    padding: 2,             // Optional: space inside the border
    margin: 2,              // Optional: space outside the border
    width: '100%',
  },

  addedTaskCard: {
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    padding: 8,
    marginVertical: 5,
    shadowColor: '#000', // ios
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3, // andriod
    borderLeftWidth: 3,
    //borderLeftColor: '#4CAF50', // default green
    width: '100%',
  },

  addedForText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '600',
    marginBottom: 4,
  },

  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },

  messageSuccess: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  swipeContainer: {
    position: 'relative',
    marginVertical: 1,
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 30,
    borderRadius: 16,
  },

  deleteIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  doneGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 30,
    borderRadius: 16,
  },

  doneIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  doneText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'stretch', // This makes both columns take the same height
    width: '100%',
    marginBottom: 10
    //justifyContent: 'space-between', // This ensures space between the two columns
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center', // This will center the icons and text vertically
    justifyContent: 'space-around', // This will distribute content evenly
    width: '100%',
    paddingHorizontal: 5,
  },
  leftColumn: {
    flex: 8.5, // 90% of the width (9 out of 10 parts)
    paddingRight: 3, // Optional: add some spacing between columns
    paddingLeft: 1, // Optional: add some spacing between columns
    justifyContent: 'flex-start', // Align content to the top
    //borderLeftWidth: 2,
    //borderLeftColor: '#4CAF50', // default green
    borderRadius: 20, // Optional: rounded corners

  },

  rightColumn: {
    flex: 1.5, // 10% of the width (1 out of 10 parts)
    alignItems: 'center', // Center content horizontally
    justifyContent: 'center', // Center content vertically
  },


});



// Update the SwipeableTaskItem component to handle both left and right swipes
const SwipeableTaskItem = ({
  item,
  handleTaskDelete,
  handleTaskDone,
  navigateToModifyTaskScreen,
  shouldBeRed,
  findName,
  Common,
  topORBottom,
  handleNotification_Local
}) => {
  const pan = React.useRef(new Animated.Value(0)).current;
  const longPressTimer = React.useRef(null);

  const panResponder = React.useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // More lenient gesture detection for both directions
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 50;
      },
      onPanResponderGrant: () => {
        // Start long press timer
        longPressTimer.current = setTimeout(() => {
          //console.log('Long press detected - navigating to modify task');
          navigateToModifyTaskScreen(item);
        }, 800); // 800ms for long press
      },
      onPanResponderMove: (evt, gestureState) => {
        // Clear long press timer if user starts moving
        if (longPressTimer.current && (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10)) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        // Handle swipe - allow both left and right
        pan.setValue(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Clear long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        // Handle swipe release
        if (gestureState.dx < -100) {
          // Left swipe - Delete
          Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task?",
            [
              { text: "Cancel", onPress: () => resetPosition() },
              { text: "Delete", onPress: () => { handleTaskDelete(item); resetPosition(); } }
            ]
          );
        } else if (gestureState.dx > 100) {
          // Right swipe - Mark as Done
          if (topORBottom === "main") {
            Alert.alert(
              "Mark as Done",
              "Are you sure you want to mark this main task as done?",
              [
                { text: "Cancel", onPress: () => resetPosition() },
                { text: "Done", onPress: () => { handleTaskDone(item); resetPosition(); } }
              ]
            );
          } else {
            Alert.alert(
              "Notify User",
              "This will send a notification to the user. Do you want to proceed?",
              [
                { text: "Cancel", onPress: () => resetPosition() },
                { text: item.taskack !== 1 ? "To-Acknowledge" : "To-Remind", onPress: () => { handleNotification_Local(item); resetPosition(); } }
              ]
            );
          }
        } else {
          resetPosition();
        }
      },
      onPanResponderTerminate: () => {
        // Clear long press timer if gesture is interrupted
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        resetPosition();
      },
    }), [item]
  );

  const resetPosition = () => {
    Animated.spring(pan, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  // Create animated opacity for the delete gradient (left swipe)
  const deleteGradientOpacity = pan.interpolate({
    inputRange: [-200, -50, 0, 50, 200],
    outputRange: [1, 0.7, 0, 0, 0],
    extrapolate: 'clamp',
  });

  // Create animated opacity for the done gradient (right swipe)
  const doneGradientOpacity = pan.interpolate({
    inputRange: [-200, -50, 0, 50, 200],
    outputRange: [0, 0, 0, 0.7, 1],
    extrapolate: 'clamp',
  });

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <View style={styles.swipeContainer}>
      {/* Delete gradient background (left swipe) */}
      <Animated.View
        style={[
          styles.gradientBackground,
          { opacity: deleteGradientOpacity }
        ]}
      >
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E', '#FFB3B3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <View style={styles.deleteIconContainer}>
            <Icon name="delete" size={30} color="#fff" />
            <Text style={styles.deleteText}>Delete</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Done gradient background (right swipe) */}
      <Animated.View
        style={[
          styles.gradientBackground,
          { opacity: doneGradientOpacity }
        ]}
      >
        <LinearGradient
          colors={['#81C784', '#A5D6A7', '#C8E6C9']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={styles.doneGradient}
        >
          <View style={styles.doneIconContainer}>
            <Icon name={topORBottom === "main" ? "check-circle" : "campaign"} size={30} color="#fff" />
            <Text style={styles.doneText}>{topORBottom === "main" ? "Done" : "Notify"}</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Main card */}
      <Animated.View
        style={[
          styles.cardOuter,
          {
            transform: [{ translateX: pan }],
            zIndex: 2 // Ensure card is above gradient
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.rowMain]}>
          <View style={[styles.leftColumn]}>
            <View style={[styles.cardLeftRight, { backgroundColor: daysRelativeToDue(item.startdatetime, item.enddatetime).color }]}>

              {/* Flag icon positioned absolutely at top right */}
              {(item.taskack !== 1 && topORBottom !== "main") && (
                <View style={styles.flagContainer}>
                  <Icon name="flag" size={12} color={Common.getColor("redred")} />
                </View>
              )}

              <Text style={[styles.cardTitleBitSmall, { color: daysRelativeToDue(item.startdatetime, item.enddatetime).textColor }]}>{item.tasktext}</Text>
              {/* <View style={[styles.dateRow]}>
                <Icon name="event" size={12} color="#black" />
                <Text style={styles.cardDateSmall}>{Common.serverDatetoUTCDate(item.startdatetime)?.toLocaleString()}</Text>
                <Text style={styles.cardDateSmall}>{ }</Text>
                <Icon name="flag" size={12} color="#black" />
                <Text style={styles.cardDateSmall}>{Common.serverDatetoUTCDate(item.enddatetime)?.toLocaleString()}</Text>
              </View> */}
            </View>
          </View>
          <View style={styles.rightColumn}>
            <View style={[styles.cardLeftRight, styles.centerIt, { backgroundColor: daysRelativeToDue(item.startdatetime, item.enddatetime).color }]}>
              <Text style={[styles.smallBlackTextCentre, { color: daysRelativeToDue(item.startdatetime, item.enddatetime).textColor }]}>{daysRelativeToDue(item.startdatetime, item.enddatetime).status}</Text>

              <Text style={[styles.cardTitleNoMargin, { color: daysRelativeToDue(item.startdatetime, item.enddatetime).textColor }]}>{daysRelativeToDue(item.startdatetime, item.enddatetime).days === "" ? daysRelativeToDue(item.startdatetime, item.enddatetime).hours : daysRelativeToDue(item.startdatetime, item.enddatetime).days}</Text>



              {/* {daysRelativeToDue(item.startdatetime, item.enddatetime).status !== 'Now' && (
                <Text style={[styles.cardTitleNoMargin, { color: daysRelativeToDue(item.startdatetime, item.enddatetime).textColor }]}>{daysRelativeToDue(item.startdatetime, item.enddatetime).days}</Text>
              )
              } */}

              <Text style={[styles.smallText, { color: daysRelativeToDue(item.startdatetime, item.enddatetime).textColor }]}>
                {returnHrsDays(item.startdatetime, item.enddatetime)}
                {/* {daysRelativeToDue(item.startdatetime, item.enddatetime).days === "" ? " hrs" : " days"} */}
              </Text>


              {/* {daysRelativeToDue(item.startdatetime, item.enddatetime).status !== 'Now' && (
                <Text style={[styles.smallText, { color: daysRelativeToDue(item.startdatetime, item.enddatetime).textColor }]}>
                  {daysRelativeToDue(item.startdatetime, item.enddatetime).days === "" ? " hrs" : " days"}
                </Text>
              )
              } */}

              {findName(item, topORBottom) !== '' && (
                <View style={styles.rowCentered}>
                  <Text style={[styles.verySmallWhiteText, { color: 'black' }]}>{`${findName(item, topORBottom)}`}</Text>
                </View>
              )}



            </View>
          </View>
        </View>


        {/* <View style={styles.rowLeftAligned}>
          <Text style={styles.cardDate}>Start: </Text>
          <Text style={styles.cardDateBold}>{Common.serverDatetoUTCDate(item.startdatetime)?.toLocaleString()}</Text>
        </View>
        <View style={styles.rowLeftAligned}>
          <Text style={styles.cardDate}>End   : </Text>
          <Text style={styles.cardDateBold}>{Common.serverDatetoUTCDate(item.enddatetime)?.toLocaleString()}</Text>
        </View> */}

        {/* <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.doneButton} onPress={() => handleTaskDone(item)}>
            <Icon name="check" size={20} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleTaskDelete(item)}>
            <Icon name="delete" size={20} color="black" style={{ marginRight: 6 }} />
            <Text style={styles.buttonTextBlack}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={() => navigateToModifyTaskScreen(item)}>
            <Icon name="edit" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        </View> */}
        {/* <View style={styles.rowLeftAligned}></View> */}
      </Animated.View>
    </View>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]); // this contains only tasks
  const [taskWithAddedBy, setTaskWithAddedBy] = useState([]); // this contains tasks with added by user, this works along witht the tasks array
  const [tasksAddedByUser, setTasksAddedByUser] = useState([]); // this is the tasks he added to others
  const [taskWithAddedBy_2, setTaskWithAddedBy_2] = useState([]);

  const { setCurrentUsrToken } = useContext(AuthContext);
  const { currentUsrToken } = useContext(AuthContext);
  const [message_s, setMessage] = useState('');


  const [isLoading, setLoading] = useState(true);

  // below 2 are for  swipe left and right functionality
  const screenWidth = Dimensions.get('window').width;
  //const translateX = useSharedValue(0);


  const navigateToModifyTaskScreen = (item) => {
    const mainTaskType = MainTasks.fromDict(item)
    const mainTaskStrinifyed = mainTaskType.toStringDict()
    navigation.navigate('ModifyTaskScreen', { 'taskStringifyed': mainTaskStrinifyed })
  }



  const handleTaskDelete = async (taskItem) => {
    console.log("handleTaskDelete called for task: ", taskItem);
    if (!(currentUsrToken.user.userid === taskItem.userid || currentUsrToken.user.userid === taskItem.addedby_userid)) {
      Alert.alert("Unauthorized", "You are not allowed to delete this task.");
      return; // Stop further execution
    }
    if (taskItem.donestatus === 1) {
      Alert.alert("Task Completed", "You cannot delete a completed task.");
      return; // Stop further execution
    }
    // Section 1 to update the screen
    if (currentUsrToken.user.userid === taskItem.userid) { // if same guy deletin self task
      const updatedTasks = tasks.filter(
        (task) => task.uniqueidentifyer !== taskItem.uniqueidentifyer
      );
      setTasks(updatedTasks);
    }
    if (currentUsrToken.user.userid === taskItem.addedby_userid) { // if  guy deletin for others
      const updatedTasks = tasksAddedByUser.filter(
        (task) => task.uniqueidentifyer !== taskItem.uniqueidentifyer
      );
      setTasksAddedByUser(updatedTasks);
    }

    // Section 2 to update the database in backend
    const mainTask = MainTasks.fromDict(taskItem) // rishon start here
    const payload = Common.getpayLoadFromMainTask111(mainTask)
    try {
      const response = await axios.post(`${BASE_URL}/DeleteTask/`, payload, {
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      console.error('Error deleting task ', error);
    }

    // remove  the Clalander even and also remove from DB if it exists
    const eventid = await getEventIdFromDatabase(taskItem.uniqueidentifyer);
    if (eventid !== null && eventid !== undefined && eventid !== "") {
      try {
        await Common.deleteEvent(eventid);
        await removeEventIdFromDatabase(taskItem.uniqueidentifyer, eventid);
      } catch (error) {
        console.error("Error cancelling notification: ", error);
      }
    }


  }



  const handleTaskDone = async (taskItem) => {
    console.log("handleTaskDone called for task: ", taskItem);
    // Section 1 to update the screen 
    //console.log(" handleTaskDone called ", taskItem.uniqueidentifyer)
    const updatedTasks = tasks.filter(
      (task) => task.uniqueidentifyer !== taskItem.uniqueidentifyer
    );
    setTasks(updatedTasks);
    // Section 2 to update the database in backend
    taskItem.donestatus = 1; // Mark the task as done
    taskItem.donestatus_datetime = new Date(); // Set the done status date to now
    const mainTask = MainTasks.fromDict(taskItem) // rishon start here
    const payload = Common.getpayLoadFromMainTask111(mainTask)
    try {
      const response = await axios.post(`${BASE_URL}/markATaskAsDone/`, payload, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      Toast.show({
        type: 'info',     // ✅ Valid type
        text1: 'Hurray !! You did it',
        text2: 'Task marked as done 🎉',
        position: 'top'
      });
    } catch (error) {
      console.error('Error markign tas kas done ', error);
    }



  }


  const handleSaveTaskDone = async (taskItem) => {
    // Section 1 to update the screen 
    console.log(" handleSaveTaskDone called ", taskItem.uniqueidentifyer)
    const updatedTasks = tasks.filter(
      (task) => task.uniqueidentifyer !== taskItem.uniqueidentifyer
    );
    setTasks(updatedTasks);
    // Section 2 to update the database in backend
    const mainTask = MainTasks.fromDict(taskItem) // rishon start here
    const mainTaskDict = mainTask.toDict()
    const payload = Common.getpayLoadFromMainTask(mainTask)
    console.log("payload  is ", payload)
    try {
      const response = await axios.post(`${BASE_URL}/markTaskAsDone/`, payload, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      Toast.show({
        type: 'info',
        text1: 'Task Saved as Done',
        text2: 'Task marked as done and saved 🎉',
        position: 'top'
      });
    } catch (error) {
      console.error('Error saving task as done ', error);
    }
  }

  const getTasks = async (mainORNot) => {
    setLoading(true);
    try {
      if (currentUsrToken === null) { // this is an unlikely condition
        console.log("Logged in USER NOT FOUNT !!!1")
        setTasks([]);
        return
      }
      const apiString = currentUsrToken.user.userid + "||||" + Common.getCurentDateAsStringYYMMDDHHMMSS_Plus_2_Months() + "||||" + mainORNot
      const response = await axios.get(`${BASE_URL}/getalltasksforuser/`, { params: { inputData: apiString } });
      let taskInstances = []
      let taskWithAddedByArray = []
      if (response !== null && response.data !== null) {
        response.data.forEach(element => {
          taskInstances.push(MainTasks.fromDict(element.maintask));
          taskWithAddedByArray.push(new MainTaskWrapperWithAddedByName(
            MainTasks.fromDict(element.maintask),
            element.added_by_name,
            element.addedby_userid
          ));
        });
        //taskInstances = response.data.map(item => MainTasks.fromDict(item));
        if (mainORNot === "main") {
          // Handle main tasks
          setTasks(taskInstances);
          setTaskWithAddedBy(taskWithAddedByArray);
        } else {
          // Handle sub-tasks
          setTasksAddedByUser(taskInstances);
          setTaskWithAddedBy_2(taskWithAddedByArray);
        }
      } else {
        console.log("We have a problem OR response is empty")
        if (mainORNot === "main") {
          // Handle main tasks
          setTasks([]);
          setTaskWithAddedBy([]);
        } else {
          // Handle sub-tasks
          setTasksAddedByUser([]);
          setTaskWithAddedBy_2([]);
        }
        setMessage("No tasks found for the user")
      }
    } catch (error) {
      console.error('Error fetching tasks: ', error, mainORNot);
    } finally {
      setLoading(false);
    }
  };


  const getTasksAddedByUser = async () => {

    try {

      const apiString = currentUsrToken.user.userid + "||||" + Common.getCurentDateAsStringYYMMDDHHMMSS_Plus_2_Months()
      const inputData = `${currentUsrToken.user.userid}||||${new Date().toISOString().split('T')[0]}`;
      console.log("ok till here", inputData)
      const response = await axios.get(`${BASE_URL}/getalltasksloggedinuserhasaddedtoothers/`, { params: { inputData: apiString } });
      //console.log("Tasks added by user response:", response.data);
      if (!response || response.data?.length === 0) {
        //setMessage("No tasks added for others")
        setTasksAddedByUser([])
      } else {
        setTasksAddedByUser(response.data);
      }

    } catch (error) {
      console.error('Error fetching tasks added by user:', error);
    } finally {

    }
  };

  // Refresh tasks when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      getTasks("main");
      getTasks("sub");
      //getTasksAddedByUser();
    }, [])
  );

  useEffect(() => {
    getTasks("main");
    getTasks("sub");
    //getTasksAddedByUser();
  }, []);

  // this function makes the task Red if starte date is of past  OR end date is in next 5 days
  const shouldBeRed = (item) => {
    const today = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(today.getDate() + 5);
    const start = new Date(item.startdatetime);
    const end = new Date(item.enddatetime);
    const isStartPast = start < today;
    const isEndNear = end <= fiveDaysFromNow;
    const shouldBeRed = isStartPast || isEndNear;
    return shouldBeRed
  }


  const renderItemOld = ({ item }) => (
    <View style={styles.card}>
      <Text style={[styles.titleBorder, shouldBeRed(item) && styles.titleBorderRed]}>{item.tasktext}</Text>
      <Text style={styles.date}>Start: {item.startdatetime?.toLocaleString()}</Text>
      <Text style={styles.date}>End: {item.enddatetime?.toLocaleString()}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.doneButton} onPress={() => handleTaskDone(item)}>
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={() => navigateToModifyTaskScreen(item)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      </View>

    </View>
  );

  const findName = (item, topORBottom) => {
    //console.log("findName called with item:", item, "topORBottom:", topORBottom);
    //console.log("findName called with taskWithAddedBy_2:", taskWithAddedBy_2);
    let task;
    if (topORBottom === "main") {
      task = taskWithAddedBy.find(task => task.addedby_userid === item.addedby_userid && task.maintask.uniqueidentifyer === item.uniqueidentifyer);
    } else {
      task = taskWithAddedBy_2.find(task => task.maintask.userid === item.userid && task.maintask.uniqueidentifyer === item.uniqueidentifyer);
    }

    return task ? task.added_by_name : 'not found.....';
  }



  const renderAddedTaskItemOld = ({ item }) => (
    <View style={styles.addedTaskCard}>
      <Text style={styles.cardTitle}>{item.tasktext}</Text>
      <View style={styles.rowLeftAligned}>
        <Text style={styles.cardDate}>Priority: P{item.priority}</Text>
        <Text style={[styles.cardDate, { marginLeft: 20 }]}>
          Status: {item.donestatus === 1 ? '✅ Done' : '⏳ Pending'}
        </Text>
      </View>
      <View style={styles.rowLeftAligned}>
        <Text style={styles.cardDate}>Start: </Text>
        <Text style={styles.cardDateBold}>{Common.serverDatetoUTCDate(new Date(item.startdatetime))?.toLocaleString()}</Text>
      </View>
      <View style={styles.rowLeftAligned}>
        <Text style={styles.cardDate}>End   : </Text>
        <Text style={styles.cardDateBold}>{Common.serverDatetoUTCDate(new Date(item.enddatetime))?.toLocaleString()}</Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.doneButton} onPress={() => handleNotification_Local(item)}>
          <Icon name="notifications" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>Notify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleTaskDelete(item)}>
          <Icon name="delete" size={20} color="black" style={{ marginRight: 6 }} />
          <Text style={styles.buttonTextBlack}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton} onPress={() => navigateToModifyTaskScreen(item)}>
          <Icon name="edit" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  const renderAddedTaskItem = ({ item }) => (
    <SwipeableTaskItem
      item={item}
      handleTaskDelete={handleTaskDelete}
      handleTaskDone={handleTaskDone}
      navigateToModifyTaskScreen={navigateToModifyTaskScreen}
      shouldBeRed={shouldBeRed}
      findName={findName}
      Common={Common}
      topORBottom={"sub"} // sub is for added by user tasks
      handleNotification_Local={handleNotification_Local}
    />
  );



  //   <View style={[styles.card, shouldBeRed(item) && styles.cardRed]}>
  //     <Text style={styles.cardTitle}>{item.tasktext}</Text>
  //     <View style={styles.rowLeftAligned}>
  //       <Text style={styles.cardDate}>Start: </Text>
  //       <Text style={styles.cardDateBold}>{Common.serverDatetoUTCDate(item.startdatetime)?.toLocaleString()}</Text>
  //     </View>
  //     <View style={styles.rowLeftAligned}>
  //       <Text style={styles.cardDate}>End   : </Text>
  //       <Text style={styles.cardDateBold}>{Common.serverDatetoUTCDate(item.enddatetime)?.toLocaleString()}</Text>
  //     </View>

  //     <View style={styles.buttonRow}>
  //       <TouchableOpacity style={styles.doneButton} onPress={() => handleTaskDone(item)}>
  //         <Icon name="check" size={20} color="#fff" style={{ marginRight: 6 }} />
  //         <Text style={styles.buttonText}>Done</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.deleteButton} onPress={() => handleTaskDelete(item)}>
  //         <Icon name="delete" size={20} color="black" style={{ marginRight: 6 }} />
  //         <Text style={styles.buttonTextBlack}>Delete</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.editButton} onPress={() => navigateToModifyTaskScreen(item)}>
  //         <Icon name="edit" size={18} color="#fff" style={{ marginRight: 6 }} />
  //         <Text style={styles.buttonText}>Edit</Text>
  //       </TouchableOpacity>
  //     </View>
  //     <View style={styles.rowLeftAligned}></View>
  //     {findName(item) !== '' && (
  //       <View style={styles.rowCentered}>
  //         <Text style={styles.smallBlackText}>{`by: ${findName(item)}`}</Text>
  //       </View>
  //     )}
  //   </View>
  // );   //end of render item 



  const handleNotification_Local = async (taskItem) => {
    //console.log("handleNotification_Local called with taskItem", taskItem);
    console.log("handleNotification_Local called with currentUsrToken.user", currentUsrToken.user);
    let resp = await Common.handleNotification(taskItem, taskItem.userid, currentUsrToken.user.userid, currentUsrToken.user.username, 'HomeScreen')
    if (resp.includes("Error")) {
      Toast.show({
        type: 'error',
        text1: 'Notification Error',
        text2: 'Failed to send notification. Please try again later. ' + resp,
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Notification Sent',
        text2: 'User has been notified successfully.',
      });
    }

  };




  // Simplified renderItem function
  const renderItem = ({ item }) => {
    return (
      <SwipeableTaskItem
        item={item}
        handleTaskDelete={handleTaskDelete}
        handleTaskDone={handleTaskDone}
        navigateToModifyTaskScreen={navigateToModifyTaskScreen}
        shouldBeRed={shouldBeRed}
        findName={findName}
        Common={Common}
        topORBottom={"main"} // main is for main tasks and bottom is for added by user tasks
        handleNotification_Local={handleNotification_Local}
      />
    );
  };

  // const renderItemVXXXXX = ({ item }) => {
  //   // let pan = new Animated.Value(0);

  //   // const panResponder = PanResponder.create({
  //   //   onMoveShouldSetPanResponder: (evt, gestureState) => {
  //   //     return Math.abs(gestureState.dx) > 20;
  //   //   },
  //   //   onPanResponderMove: (evt, gestureState) => {
  //   //     if (gestureState.dx < 0) { // Only allow left swipe
  //   //       pan.setValue(gestureState.dx);
  //   //     }
  //   //   },
  //   //   onPanResponderRelease: (evt, gestureState) => {
  //   //     if (gestureState.dx < -100) {
  //   //       Alert.alert(
  //   //         "Delete Task",
  //   //         "Are you sure you want to delete this task?",
  //   //         [
  //   //           { text: "Cancel", onPress: () => resetPosition() },
  //   //           { text: "Delete", onPress: () => { handleTaskDelete(item); resetPosition(); } }
  //   //         ]
  //   //       );
  //   //     } else {
  //   //       resetPosition();
  //   //     }
  //   //   },
  //   // });

  //   // const resetPosition = () => {
  //   //   Animated.spring(pan, {
  //   //     toValue: 0,
  //   //     useNativeDriver: false,
  //   //   }).start();
  //   // };

  //   // // Create animated opacity for the gradient background
  //   // const gradientOpacity = pan.interpolate({
  //   //   inputRange: [-200, -50, 0],
  //   //   outputRange: [1, 0.7, 0],
  //   //   extrapolate: 'clamp',
  //   // });

  //   // return (
  //   //   <View style={styles.swipeContainer}>
  //   //     {/* Gradient background that appears on swipe */}
  //   //     <Animated.View
  //   //       style={[
  //   //         styles.gradientBackground,
  //   //         { opacity: gradientOpacity }
  //   //       ]}
  //   //     >
  //   //       <LinearGradient
  //   //         colors={['#FF6B6B', '#FF8E8E', '#FFB3B3']}
  //   //         start={{ x: 0, y: 0 }}
  //   //         end={{ x: 1, y: 0 }}
  //   //         style={styles.gradient}
  //   //       >
  //   //         <View style={styles.deleteIconContainer}>
  //   //           <Icon name="delete" size={30} color="#fff" />
  //   //           <Text style={styles.deleteText}>Delete</Text>
  //   //         </View>
  //   //       </LinearGradient>
  //   //     </Animated.View>

  //   //     {/* Main card */}
  //   //     <Animated.View
  //   //       style={[
  //   //         styles.card,
  //   //         shouldBeRed(item) && styles.cardRed,
  //   //         { transform: [{ translateX: pan }] }
  //   //       ]}
  //   //       {...panResponder.panHandlers}
  //   //     >
  //   //       <Text style={styles.cardTitle}>{item.tasktext}</Text>
  //   //       <View style={styles.rowLeftAligned}>
  //   //         <Text style={styles.cardDate}>Start: </Text>
  //   //         <Text style={styles.cardDateBold}>{Common.serverDatetoUTCDate(item.startdatetime)?.toLocaleString()}</Text>
  //   //       </View>
  //   //       <View style={styles.rowLeftAligned}>
  //   //         <Text style={styles.cardDate}>End   : </Text>
  //   //         <Text style={styles.cardDateBold}>{Common.serverDatetoUTCDate(item.enddatetime)?.toLocaleString()}</Text>
  //   //       </View>

  //   //       <View style={styles.buttonRow}>
  //   //         <TouchableOpacity style={styles.doneButton} onPress={() => handleTaskDone(item)}>
  //   //           <Icon name="check" size={20} color="#fff" style={{ marginRight: 6 }} />
  //   //           <Text style={styles.buttonText}>Done</Text>
  //   //         </TouchableOpacity>
  //   //         <TouchableOpacity style={styles.deleteButton} onPress={() => handleTaskDelete(item)}>
  //   //           <Icon name="delete" size={20} color="black" style={{ marginRight: 6 }} />
  //   //           <Text style={styles.buttonTextBlack}>Delete</Text>
  //   //         </TouchableOpacity>
  //   //         <TouchableOpacity style={styles.editButton} onPress={() => navigateToModifyTaskScreen(item)}>
  //   //           <Icon name="edit" size={18} color="#fff" style={{ marginRight: 6 }} />
  //   //           <Text style={styles.buttonText}>Edit</Text>
  //   //         </TouchableOpacity>
  //   //       </View>
  //   //       <View style={styles.rowLeftAligned}></View>
  //   //       {findName(item) !== '' && (
  //   //         <View style={styles.rowCentered}>
  //   //           <Text style={styles.smallBlackText}>{`by: ${findName(item)}`}</Text>
  //   //         </View>
  //   //       )}
  //   //     </Animated.View>
  //   //   </View>
  //   // );
  // };

  if (isLoading) {
    // Show main loader only if both are loading initially
    return Common.LoadingScreen();
  }
  return (

    <LinearGradient
      colors={[Common.getColor("backGradientEnd"), Common.getColor("backGradientStart")]}   // '#A4Be91'
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >

      <Image
        source={require('../assets/logo2.png')} // Adjust path to your logo
        style={styles.watermarkLogo}
        resizeMode="contain"
      />

      <View style={styles.topSection}>
        <View style={styles.rowLeftAligned}>
          {/* <Text style={styles.title}>{Common.toProperCase(currentUsrToken.user.username)} </Text> */}
          <Text style={styles.titleSupport}>{Common.toProperCase(currentUsrToken.user.username)}, make Progress...mark One as Done!</Text>
        </View>

        {message_s !== '' && (
          <Text style={[styles.message, styles.messageSuccess]}>{message_s}</Text>
        )}
      </View>

      <View style={styles.middleSection}>
        <View style={styles.middle_top}>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.uniqueidentifyer}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>One step at a time, start adding tasks!</Text>
            )}
          />
        </View>
        <View style={styles.middle_bottom}>
          <Text style={[styles.titleSupport, { textAlign: 'center' }]}>Task you added for others</Text>
          {isLoading ? (
            <>
              {Common.LoadingScreen()}
            </>
          ) : (
            <FlatList
              data={tasksAddedByUser}
              keyExtractor={(item) => item.uniqueidentifyer}
              renderItem={renderAddedTaskItem}
              contentContainerStyle={{ paddingBottom: 10 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <Text style={styles.emptyText}>No tasks added for others</Text>
              )}
            />
          )}
        </View>
      </View>

      <View style={styles.bottomSection}>
      </View>
    </LinearGradient>
  );

}


