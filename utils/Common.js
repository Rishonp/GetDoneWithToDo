import { UserNToken } from "./Token"
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../utils/config';
import axios from 'axios';
import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import * as Calendar from 'expo-calendar';
import * as Linking from 'expo-linking';
import { taskcal } from "./Users";



export const getDisplayMode = (mode) => {
    // Inline only works on iOS 14+ for "date" mode
    if (Platform.OS === "ios" && mode === "date" && parseInt(Platform.Version, 10) >= 14) {
        return "inline"; // Calendar style
    }
    return "spinner"; // Works everywhere
};


export const getpayload_taskcal = (taskcal) => {
    return {
        params: {
            uniqueidentifyer: taskcal.uniqueidentifyer,
            eventid: taskcal.eventid,
            maintask_uniqueidentifyer: taskcal.maintask_uniqueidentifyer
        }
    }
}




// Request permission to use Calendar
export const requestPermission = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') {
        //Alert.alert('Permission Required', 'Calendar permission is required.');
        return false;
    }
    return true;
}


// Get default calendar ID
export const getDefaultCalendarId = async () => {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find(c => c.isPrimary) || calendars[0];
    return defaultCalendar?.id;
}


// Fetch event details by ID
export const fetchEventDetails = async (id) => {
    if (!id) {
        Alert.alert('Error', 'No event ID provided.');
        return;
    }
    try {
        const event = await Calendar.getEventAsync(id);
        if (event) {
            console.log('Event details:', event);
            return event;
        } else {
            Alert.alert('Not Found', 'Event not found.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching event:', error);
        return null;
    }
}


export const getDeviceTimeZone = () => {
    try {
        // Get the device's timezone
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("Device timezone:", timeZone);
        return timeZone;
    } catch (error) {
        console.error("Error getting device timezone:", error);
        // Fallback to a default timezone
        return "America/New_York";
    }
};

// Add timezone validation function
export const validateTimeZone = (timeZone) => {
    try {
        // Test if the timezone is valid by creating a date with it
        new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
        return timeZone;
    } catch (error) {
        console.warn(`Invalid timezone: ${timeZone}, falling back to America/New_York`);
        return "America/New_York";
    }
};


// Create event
export const createEvent = async (title, location, startDate, endDate, notes, timeZone) => {
    if (!(await requestPermission())) return null;

    const calendarId = await getDefaultCalendarId();
    if (!calendarId) {
        Alert.alert('Error', 'No calendar found on this device.');
        return null;
    }

    // Get the device timezone if not provided
    const deviceTimeZone = timeZone || getDeviceTimeZone();
    const validTimeZone = validateTimeZone(deviceTimeZone);

    console.log("Using timezone for calendar event:", validTimeZone);
    try {
        const id = await Calendar.createEventAsync(calendarId, {
            title,
            location,
            startDate,
            endDate,
            notes: 'GetDoneWithToDo',
            timeZone: validTimeZone,  //'America/New_York',
        });
        return id;
        //setEventId(id);
        //Alert.alert('Success', `Event created with ID: ${id}`);

        // Immediately fetch details after creation
        //fetchEventDetails(id);
    } catch (error) {
        console.error('Error creating event:', error);
        return null;

    }
}


// Edit event
export const editEvent = async (title, location, startDate, endDate, notes, timeZone, eventId) => {
    console.log("editEvent called with eventId", eventId);

    if (!eventId) {
        console.error('No event ID provided');
        return false;
    }

    try {
        // Validate dates
        if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
            console.error('Invalid date objects provided');
            return false;
        }


        // Check if event exists before updating
        const existingEvent = await Calendar.getEventAsync(eventId);
        if (!existingEvent) {
            console.error('Event not found with ID:', eventId);
            return false;
        }
        console.log("Existing event found!!!!!!:", existingEvent);


        // Map common timezone names to proper identifiers
        let properTimeZone = timeZone;
        if (timeZone === "GMT" || timeZone === "UTC") {
            properTimeZone = "Europe/London"; // GMT equivalent
        } else if (!timeZone || timeZone === 0) {
            properTimeZone = existingEvent.timeZone || "America/New_York";
        }


        console.log("Updating event with:", {
            title,
            location,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            notes,
            timeZone: existingEvent.timeZone
        });

        // Update the event with all provided parameters
        await Calendar.updateEventAsync(existingEvent.id, {
            title: "Hehe HoHo Haha ",
            // location: location,
            // startDate: startDate,
            // endDate: endDate,
            // notes: notes,
            // timeZone: existingEvent.timeZone,
        });

        // Verify 
        let checkEvent = await Calendar.getEventAsync(existingEvent.id);
        if (!checkEvent) {
            console.error("Event deleted after title update");
            return false;
        } else {
            console.log("Event still exists after update:", checkEvent);
        }


        console.log("Event successfully updated");
        return true;

    } catch (error) {
        console.error('Error updating event:', error);

        // More detailed error logging
        if (error.message.includes('not found')) {
            console.error('Event may have been deleted or moved to a different calendar');
        } else if (error.message.includes('permission')) {
            console.error('Calendar permission issue');
        }

        return false;
    }
}


// Delete event
export const deleteEvent = async (eventId) => {
    if (!eventId || eventId === "null" || eventId === "undefined" || eventId === "") {
        console.log('No event ID provided for deleteion');
        return false;
    }
    try {
        await Calendar.deleteEventAsync(eventId);
        return true;
    } catch (error) {
        console.log('Error deleting event:', error);
        return false;
    }
}



export const storeEventIdInDatabase = async (eventId, taskUniqueIdentifier) => {
    tc = new taskcal("", eventId, taskUniqueIdentifier)
    const payload = getpayload_taskcal(tc)
    try {
        const response = await axios.post(`${BASE_URL}/AddToCalendar/`, payload, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        //console.log("Response from AddToCalendar API", response);
        if (response.status === 200) {
            return "Success - Task Added To Calendar";
        } else {
            console.error('Error adding task ', response);
            return "Error - Failed to Add Task";
        }
    } catch (error) {
        console.error('Error saving task as done ', error);
        return "Error - Failed to Add Task" + (error?.message ? error.message : "");
    }
}




// Open in native calendar
export const openInCalendar = (eventId) => {
    if (!eventId) {
        Alert.alert('Error', 'No event to open.');
        return;
    }
    if (Platform.OS === 'ios') {
        Linking.openURL(`calshow:${eventId}`);
    } else {
        Linking.openURL(`content://com.android.calendar/events/${eventId}`);
    }
}

export const handleNotification = async (taskItem, to_userid, userid, username, commingFrom) => {
    //console.log("handleNotification called with taskItem", taskItem, "to_userid", to_userid, "userid", userid, "username", username, "comingFrom", commingFrom);
    let userPushToken
    // First, get the target user's push token from your database
    const targetUserId = to_userid;      // "71f424c6-3fbf-44a9-8e91-64c1e9e92b6e"; // Replace with the actual target user ID

    userPushToken = await getNotiToken(targetUserId);
    if (userPushToken === null || userPushToken === undefined || userPushToken === "" || userPushToken.includes("Error")) {
        //   Toast.show({
        //     type: 'error',
        //     text1: 'User Not Available' + userPushToken,
        //     text2: 'User does not have push notifications enabled',
        //     position: 'top'
        //   });
        return "Error - User Not Available";
    }

    let resp = await sendNotofication(userPushToken, userid, username, taskItem, commingFrom);
    if (resp === "") {
        return "Notification Sent";
        //   Toast.show({
        //     type: 'success',
        //     text1: 'Notification Sent! 🔔',
        //     text2: `Reminder sent to user`,
        //     position: 'top'
        //   });
    } else {
        return "Error - Notification Failed";
        //   Toast.show({
        //     type: 'error',
        //     text1: 'Notification Failed!',
        //     text2: `Failed to send reminder to user`,
        //     position: 'top'
        //   });
    }

};




export const getNotiToken = async (targetUserId) => {
    let tokenResponse = null;
    try {
        tokenResponse = await axios.get(`${BASE_URL}/getUserPushToken/`, { params: { userId: targetUserId } });
        if (!tokenResponse.data || !tokenResponse.data.notitoken) {
            return "Error - No token found for the user";
        }
        return tokenResponse.data.notitoken;
    } catch (error) {
        if (typeof error.response !== 'undefined') {
            if (error.response.data?.detail) {
                return "Error - " + error.response.data.detail;
            } else {
                return "Error - " + error.response.status;
            }
        } else if (error.request) {
            return "Error - No response from Server";
        } else {
            return "Error - " + error.message;
        }
    }
}

export const sendNotofication = async (userPushToken, fromUserId, fromUserName, taskItem, commingFrom) => {
    let theMessage = "";
    if (commingFrom === 'ModifyTaskScreen') {
        theMessage = ` I updated the Task : ${taskItem.tasktext} `;
    } else if (commingFrom === 'HomeScreen') {
        theMessage = `Don't forget: ${taskItem.taskack !== 1 ? "To-Acknowledge " : ""} ${taskItem.tasktext} due on ${serverDatetoUTCDate(parseToUTCDateByAddingZ(taskItem.enddatetime))?.toLocaleString()}`;
    }
    const notificationPayload = {
        to: userPushToken,
        sound: 'default',
        title: `from ${fromUserName}`,
        body: theMessage,
        data: {
            taskId: taskItem.uniqueidentifyer,
            taskText: taskItem.tasktext,
            fromUserId: fromUserId,
            fromUserName: fromUserName,
            type: 'task_reminder'
        },
    };

    try {
        const response = await axios.post(`${BASE_URL}/notify/`, notificationPayload, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (response.status === 200) {
            return "";
        } else {
            return "Error - Failed to send notification";
        }
    } catch (error) {
        if (typeof error.response !== 'undefined') {
            if (error.response.data?.detail) {
                return "Error -" + error.response.data.detail;
            } else {
                return "Error -" + error.response.status;
            }
        } else if (error.request) {
            return "Error - No response from Server";
        } else {
            return "Error - " + error.message;
        }
    }
}




export const getpayLoadFromMainTask111 = (mainTask) => {
    //console.log("Creating payload from mainTask:", mainTask);
    //console.log(typeof mainTask.startdatetime, mainTask.startdatetime instanceof Date);
    //console.log(mainTask.startdatetime.hasOwnProperty("toISOString"));
    //console.log(mainTask.startdatetime.toISOString());


    const payload = {
        params: {
            userid: mainTask.userid,
            tasktext: mainTask.tasktext,
            addtocal: mainTask.addtocal,
            priority: mainTask.priority,
            startdatetime: mainTask.startdatetime.toISOString(),
            enddatetime: mainTask.enddatetime.toISOString(),
            donestatus: mainTask.donestatus,
            donestatus_datetime: mainTask.donestatus_datetime.toISOString(),
            remarks: mainTask.remarks,
            addedby_userid: mainTask.addedby_userid,
            addedby_datetime: mainTask.addedby_datetime.toISOString(),
            uniqueidentifyer: mainTask.uniqueidentifyer,
            taskack: mainTask.taskack,
            taskack_datetime: mainTask.taskack_datetime.toISOString(),
            donestatus_datetime: mainTask.donestatus_datetime.toISOString()
        }
    };
    return payload;
}



export const getpayLoadFromMainTask = (mainTask) => {
    const payload = {
        params: {
            userid: mainTask.userid,
            tasktext: mainTask.tasktext,
            addtocal: mainTask.addtocal,
            priority: mainTask.priority,
            startdatetime: mainTask.startdatetime,
            enddatetime: mainTask.enddatetime,
            donestatus: mainTask.donestatus,
            donestatus_datetime: mainTask.donestatus_datetime,
            remarks: mainTask.remarks,
            addedby_userid: mainTask.addedby_userid,
            addedby_datetime: mainTask.addedby_datetime,
            uniqueidentifyer: mainTask.uniqueidentifyer,
            taskack: mainTask.taskack,
            taskack_datetime: mainTask.taskack_datetime,
            donestatus_datetime: mainTask.donestatus_datetime
        }
    };
    return payload;
}






export const getColor = (value) => {
    switch (value) {
        case 'oldred':
            return '#FDECEA';
        case 'redred':
            return '#EC6449';
        case 'red':
            return '#FDE2E4';
        case 'redText':
            return '#E63946';
        case 'amber':
            return '#FFF4E6';
        case 'amberText':
            return '#FFB703';
        case 'green':
            return '#E0F7F4';
        case 'greenText':
            return '#2A9D8F';
        case 'darkgreen':
            return '#E6F0FF';
        case 'blueblue':
            return "#3A86FF";
        case 'Ia1':
            return '#A8A486';
        case 'Ia2':
            return '#C9C0A1';
        case 'backGradientStart':
            return '#A0C4FF';
        case 'backGradientMiddle':
            return '#D0EFFF';
        case 'backGradientEnd':
            return '#F9F7F7';



    }
}


export const getColorOld = (value) => {
    switch (value) {
        case 'oldred':
            return '#FDECEA';
        case 'redred':
            return '#EC6449';
        case 'red':
            return '#E85252';    // backup  #D78C27
        case 'amber':
            return '#D4A414';
        case 'green':
            return '#7A9D43';
        case 'darkgreen':
            return '#4D5A3A';
        case 'Ia1':
            return '#A8A486';
        case 'Ia2':
            return '#C9C0A1';
        case 'backGradientStart':
            return '#869f64';
        case 'backGradientEnd':
            return '#ffffff';
    }
}

export const isUTCDate = (x) => {
    if (Object.prototype.toString.call(x) === "[object Date]" && !isNaN(x)) {
        return x.toISOString() === x.toUTCString();
    }
    return false;
}

export const parseToUTCDateByAddingZ = (dateString) => {
    //console.log("parseToUTCDateByAddingZ called with dateString", dateString);
    //console.log("parseToUTCDateByAddingZ called with dateString", typeof dateString);
    //console.log("parseToUTCDateByAddingZ called with dateString", dateString instanceof Date);
    //typeof x === 'string'
    // Ensure Z is appended only if not already present
    let utcString
    if (dateString instanceof Date) {
        if (isUTCDate(dateString)) {
            console.log("Returning as it is Date", dateString);
            return dateString; // If it's already a UTC date, return it as is
        } else {
            const year = dateString.getFullYear();
            const month = String(dateString.getMonth() + 1).padStart(2, '0'); // Months are 0-based
            const day = String(dateString.getDate()).padStart(2, '0');  // Day of the month
            const hours = String(dateString.getHours()).padStart(2, '0');   // Hours
            const minutes = String(dateString.getMinutes()).padStart(2, '0'); // Minutes
            const seconds = String(dateString.getSeconds()).padStart(2, '0'); // Seconds
            //const milliseconds = String(dateString.getMilliseconds()).padStart(3, '0'); // Milliseconds
            stringDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
            tmpDate = new Date(stringDate);
            return tmpDate
        }
    }
    if (typeof dateString === 'string') {
        utcString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
        return new Date(utcString);
    } else {
        return null; // Handle cases where dateString is not a string or Date
    }

};



export const serverDatetoUTCDate = (inDate) => {
    //console.log("serverDatetoUTCDate called with inDate dddddddddddddddddd", inDate);
    //console.log("serverDatetoUTCDate called with inDate dddddddddddddddddd", typeof inDate);
    //console.log("serverDatetoUTCDate called with inDate dddddddddddddddddd", typeof inDate === "string");
    //console.log("serverDatetoUTCDate called with inDate dddddddddddddddddd", inDate instanceof Date);

    if (inDate && typeof inDate === "string") {
        //console.log("serverDatetoUTCDate called with string", inDate);
        inDate = parseToUTCDateByAddingZ(inDate);
    }

    if (!(inDate instanceof Date)) {
        console.log("EWRROR it is not date", typeof inDate);
        return null
    }
    if (!inDate) {
        console.log("EWRROR !inDate", inDate);
        return null;
    }
    //console.log("OK till ehre eeeeeeee", String(inDate.getMonth() + 1).padStart(2, '0'));
    const year = inDate.getFullYear();
    const month = String(inDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(inDate.getDate()).padStart(2, '0');  // Day of the month
    const hours = String(inDate.getHours()).padStart(2, '0');   // Hours
    const minutes = String(inDate.getMinutes()).padStart(2, '0'); // Minutes
    const seconds = String(inDate.getSeconds()).padStart(2, '0'); // Seconds
    //const milliseconds = String(inDate.getMilliseconds()).padStart(3, '0'); // Milliseconds
    let stringDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    let tmpDate = new Date(stringDate);
    return tmpDate
};

export const convertDateToStringDDMMYYYYHHMMSS = (date) => {
    if (!(date instanceof Date)) {
        console.log("EWRRORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR", typeof date);
        date = new Date();
    }
    //console.log("convertDateToStringDDMMYYYYHHMMSS called with date", typeof date);
    //console.log("convertDateToStringDDMMYYYYHHMMSS called with date", date);
    //console.log("convertDateToStringDDMMYYYYHHMMSS called with date", date instanceof Date);
    date.setDate(date.getDate() + 1); // Add one day

    const dayOfMonth = date.getDate();
    const paddedDay = dayOfMonth.toString().padStart(2, '0');

    const month_r = date.getMonth() + 1; // Months are zero-based, so we add 1
    const paddedMonth = month_r.toString().padStart(2, '0');

    const hours_r = date.getHours();
    const paddedHours = hours_r.toString().padStart(2, '0');

    const minutes_r = date.getMinutes();
    const paddedMinutes = minutes_r.toString().padStart(2, '0');

    const seconds_r = date.getSeconds();
    const paddedSeconds = seconds_r.toString().padStart(2, '0');

    let returnValue = "" + paddedDay + "-" + paddedMonth + "-" + date.getFullYear().toString() + " " + paddedHours + ":" + paddedMinutes + ":" + paddedSeconds;
    return returnValue;

    const year_r = date.getFullYear();
    const paddedYear = year_r.toString().padStart(4, '0');

    console.log("convertDateToStringDDMMYYYYHHMMSS", paddedDay, paddedMonth, paddedYear);
    return `${paddedDay}-${paddedMonth}-${paddedYear} `;


    // const day = String(date.getDate()).padStart(2, '0');
    // const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    // const year = date.getFullYear();
    // const hours = String(date.getHours()).padStart(2, '0');
    // const minutes = String(date.getMinutes()).padStart(2, '0');
    // const seconds = String(date.getSeconds()).padStart(2, '0');
    // console.log("convertDateToStringDDMMYYYYHHMMSS", day, month, year, hours, minutes, seconds);
    // return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

/* Duplicate deleteUserTokenInMobile removed */

export const formatToLocalDateString_inputIsDataObj = (date) => {
    if (!date) return '';
    if (!(date instanceof Date)) return '';
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

export const formatToUTCString__inputIsDataObj = (date) => {
    if (!date) return '';
    if (!(date instanceof Date)) return '';
    return date.toISOString(); // Native JS Date in UTC
};


export const storeUserTokenInMobile_Dict = async (usrTknDict) => {
    let stringDict = JSON.stringify(usrTknDict)
    try {
        //console.log("About to Store to Secure Store", stringDict)
        await SecureStore.setItemAsync('token', stringDict);
        //console.log(" Secure Store Succesful ")
        return usrTknDict
    } catch (error) {
        console.log("error storing  token", error)
        return null
    }
};


export const deleteFirstTimeinMobile = async () => {
    try {
        await SecureStore.deleteItemAsync('firstTime');
    } catch (error) {
        console.log("error deleting firstTime", error)
    }
};



export const storeFirstTimeinMobile = async (storeWhatBoolean) => {
    const toStore = storeWhatBoolean == true ? "Y" : "N"
    try {
        await SecureStore.setItemAsync('firstTime', toStore);
        return toStore
    } catch (error) {
        console.log("error storing  token", error)
        return null
    }
};


export const retrieveFirstTimeInMobile = async () => {
    const result = await SecureStore.getItemAsync('firstTime');
    //console.log("retrieveFirstTimeInMobile result", result);
    //console.log("retrieveFirstTimeInMobile result", typeof result);
    //console.log("retrieveFirstTimeInMobile result", JSON.parse(result));
    //console.log("retrieveFirstTimeInMobile result", JSON.parse(result) == "Y");
    //console.log("retrieveFirstTimeInMobile result", JSON.parse(result) == "N");
    if (result) {
        return result === "Y" ? true : false;
    } else {
        return true;
    }
};



export const retrieveUserTokenInMobile = async () => {
    const result = await SecureStore.getItemAsync('token');
    if (result) {
        const parsedToDict = JSON.parse(result);
        usrTknObj = UserNToken.fromDict(parsedToDict)
        return usrTknObj
    } else {
        return null
    }
};


export const deleteUserTokenInMobile = async () => {
    //console.log("deleteUserTokenInMobile BEING CALLED!!!! ")
    try {

        await SecureStore.deleteItemAsync('token');
        //console.log("token sucesfully deleted")
        return true
    } catch (error) {
        console.log("error deleting token", error)
        return false
    }
};


export const getCurentDateAsStringYYMMDDHHMMSS_Plus_2_Months = () => {
    let now = new Date();
    now.setMonth(now.getMonth() + 2);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return String(formattedDate)
};

export const SlidedDateTime = (sourceDate, sourceTime) => {
    //console.log("SlidedDateTime called with sourceDate", sourceDate, "sourceTime", sourceTime);
    try {
        //console.log("inside try block of SlidedDateTime");
        sourceDate.setUTCHours(sourceTime.getUTCHours());
        sourceDate.setUTCMinutes(sourceTime.getUTCMinutes());
        sourceDate.setUTCSeconds(sourceTime.getUTCSeconds());
        sourceDate.setUTCMilliseconds(sourceTime.getUTCMilliseconds());
        //console.log("SlidSlidedDateTime returning with ", sourceDate);
        return sourceDate;
    } catch (error) {
        console.error("Error in SlidedDateTime:", error);
        //console.log("SlidSlidedDateTime returning with nothing ");
        return null;
    }
};


export const validateStartDateAndEndDate = (startDate, endDate) => {
    if (startDate instanceof Date === false || endDate instanceof Date === false) {
        return "Invalid Date Passed "; // Invalid if either date is missing
    }
    if (!startDate || !endDate) {
        return "Empty Date Passed"; // Invalid if either date is missing
    }
    if (endDate < startDate) {
        return "End date cannot be earlier than start date"; // Invalid if start date is after end date
    }
    return ""; // Valid dates
};



export const takeDateFromOneAndTimeFromOther = (date_date, date_time) => {
    let combinedDate = new Date(date_date);
    combinedDate.setFullYear(date_date.getFullYear());
    combinedDate.setMonth(date_date.getMonth());
    combinedDate.setDate(date_date.getDate());
    combinedDate.setUTCHours(date_time.getUTCHours());
    combinedDate.setUTCMinutes(date_time.getUTCMinutes());
    combinedDate.setUTCSeconds(date_time.getUTCSeconds());
    combinedDate.setUTCMilliseconds(date_time.getUTCMilliseconds());
    return combinedDate;
};


export const takeDateFromOneAndTimeFromOther_V2 = (date_date, date_time) => {
    let combinedDate = new Date(date_date);
    combinedDate.setFullYear(date_date.getFullYear());
    combinedDate.setMonth(date_date.getMonth());
    combinedDate.setDate(date_date.getDate());
    combinedDate.setHours(date_time.getHours());
    combinedDate.setMinutes(date_time.getMinutes());
    combinedDate.setSeconds(date_time.getSeconds());
    combinedDate.setMilliseconds(date_time.getMilliseconds());
    return combinedDate;
};


export const toProperCase = (str) => {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}


export const LoadingScreen = () => {
    //console.log("LoadingScreen is being rendered"); // Add this to debug



    return (

        <LinearGradient
            colors={[getColor("backGradientEnd"), getColor("backGradientStart")]}   // '#A4Be91'
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
        >
            <LottieView
                source={require('../assets/checkbox.json')}
                autoPlay
                loop
                style={{ width: 200, height: 200 }}
            />

        </LinearGradient>





        // <View style={styles.container}>
        //     <Text style={styles.loadingText}>Loading......</Text>
        // </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: '#fff'
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
        fontWeight: '600',
    }
});




//console.log("=== COMMON.JS EXPORT DEBUG ===");
//console.log("removeEventIdFromDatabase exists locally:", typeof removeEventIdFromDatabase);