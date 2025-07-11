import { UserNToken } from "./Token"
import * as SecureStore from 'expo-secure-store';


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


export const convertDateToStringDDMMYYYYHHMMSS = (date) => {
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
export const storeUserTokenInMobile_Dict = async (usrTknDict) => {
    let stringDict = JSON.stringify(usrTknDict)
    try {
        console.log("About to Store to Secure Store", stringDict)
        await SecureStore.setItemAsync('token', stringDict);
        console.log(" Secure Store Succesful ")
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

export const deleteUserTokenInMobile = async () => {
    console.log("deleteUserTokenInMobile BEING CALLED!!!! ")
    try {

        await SecureStore.deleteItemAsync('token');
        console.log("token sucesfully deleted")
        return true
    } catch (error) {
        console.log("error deleting token", error)
        return false
    }
};
