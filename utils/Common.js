import { UserNToken } from "./Token"
import * as SecureStore from 'expo-secure-store';



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
            return '#D78C27';
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



export const parseToUTCDateByAddingZ = (dateString) => {
    // Ensure Z is appended only if not already present
    const utcString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
    return new Date(utcString);
};



export const serverDatetoUTCDate = (inDate) => {
    if (inDate && typeof inDate === "string") {
        console.log("serverDatetoUTCDate called with string", inDate);
        inDate = parseToUTCDateByAddingZ(inDate);
    }

    if (!(inDate instanceof Date)) {
        console.log("EWRROR", typeof inDate);
        return null
    }
    if (!inDate) {
        console.log("EWRROR !inDate", inDate);
        return null;
    }
    const year = inDate.getFullYear();
    const month = String(inDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(inDate.getDate()).padStart(2, '0');  // Day of the month
    const hours = String(inDate.getHours()).padStart(2, '0');   // Hours
    const minutes = String(inDate.getMinutes()).padStart(2, '0'); // Minutes
    const seconds = String(inDate.getSeconds()).padStart(2, '0'); // Seconds
    //const milliseconds = String(inDate.getMilliseconds()).padStart(3, '0'); // Milliseconds
    stringDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
    tmpDate = new Date(stringDate);
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
    return date.toLocaleString(); // Local formata
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
        console.log("token sucesfully deleted")
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
        console.log("inside try block of SlidedDateTime");
        sourceDate.setUTCHours(sourceTime.getUTCHours());
        sourceDate.setUTCMinutes(sourceTime.getUTCMinutes());
        sourceDate.setUTCSeconds(sourceTime.getUTCSeconds());
        sourceDate.setUTCMilliseconds(sourceTime.getUTCMilliseconds());
        console.log("SlidSlidedDateTime returning with ", sourceDate);
        return sourceDate;
    } catch (error) {
        console.error("Error in SlidedDateTime:", error);
        console.log("SlidSlidedDateTime returning with nothing ");
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