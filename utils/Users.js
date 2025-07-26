class UserRelation {
    constructor(primaryuserid, relationuserid, uniqueidentifyer, relationuserid_ack) {
        this.primaryuserid = primaryuserid;
        this.relationuserid = relationuserid;
        this.uniqueidentifyer = uniqueidentifyer;
        this.relationuserid_ack = relationuserid_ack;

    }
    static fromDict(data) {
        return new UserRelation(
            data.primaryuserid || '',
            data.relationuserid || '',
            data.uniqueidentifyer || '',
            data.relationuserid_ack || ''
        );
    }
    toDict() {
        return {
            primaryuserid: this.primaryuserid,
            relationuserid: this.relationuserid,
            uniqueidentifyer: this.uniqueidentifyer,
            relationuserid_ack: this.relationuserid_ack
        };
    }

}

export { UserRelation }






class Users {
    constructor(userid, username, useremail, userpass_hashed, user_createDatetime, user_isActive) {
        this.userid = userid;
        this.username = username;
        this.useremail = useremail;
        this.userpass_hashed = userpass_hashed;
        this.user_createDatetime = user_createDatetime; // should be a Date object
        this.user_isActive = user_isActive; // boolean
    }
    static fromDict(data) {
        return new Users(
            data.userid || '',
            data.username || '',
            data.useremail || '',
            data.userpass_hashed || '',
            new Date(data.user_createDatetime) || new Date(),
            data.user_isActive || 0
        );
    }

    toDict() {
        return {
            userid: this.userid,
            username: this.username,
            useremail: this.useremail,
            userpass_hashed: this.userpass_hashed,
            user_createDatetime: this.user_createDatetime.toISOString(),
            user_isActive: this.user_isActive
        };
    }
}
export default Users;

class MainTasks {
    constructor(userid, tasktext, addtocal, priority, startdatetime, enddatetime, donestatus, donestatus_datetime, remarks, addedby_userid, addedby_datetime, uniqueidentifyer, taskack, taskack_datetime) {
        this.userid = userid;
        this.tasktext = tasktext;
        this.addtocal = addtocal;
        this.priority = priority;
        this.startdatetime = startdatetime;
        this.enddatetime = enddatetime;
        this.donestatus = donestatus;
        this.donestatus_datetime = donestatus_datetime;
        this.remarks = remarks;
        this.addedby_userid = addedby_userid;
        this.addedby_datetime = addedby_datetime;
        this.uniqueidentifyer = uniqueidentifyer;
        this.taskack = taskack;
        this.taskack_datetime = taskack_datetime;
    }
    static fromDict(data) {
        return new MainTasks(
            data.userid || '',
            data.tasktext || '',
            data.addtocal || 0,
            data.priority || 0,
            data.startdatetime ? new Date(data.startdatetime) : new Date(),
            data.enddatetime ? new Date(data.enddatetime) : new Date(),
            data.donestatus || 0,
            data.donestatus_datetime ? new Date(data.donestatus_datetime) : new Date(),
            data.remarks || '',
            data.addedby_userid || '',
            data.addedby_datetime ? new Date(data.addedby_datetime) : new Date(),
            data.uniqueidentifyer || '',
            data.taskack || 0,
            data.taskack_datetime ? new Date(data.taskack_datetime) : new Date()
        );
    }

    toDict() {
        return {
            userid: this.userid,
            tasktext: this.tasktext,
            addtocal: this.addtocal,
            priority: this.priority,
            startdatetime: this.startdatetime.toISOString(),
            enddatetime: this.enddatetime.toISOString(),
            donestatus: this.donestatus,
            donestatus_datetime: this.donestatus_datetime.toISOString(),
            remarks: this.remarks,
            addedby_userid: this.addedby_userid,
            addedby_datetime: this.addedby_datetime.toISOString(),
            uniqueidentifyer: this.uniqueidentifyer,
            taskack: this.taskack,
            taskack_datetime: this.taskack_datetime.toISOString()
        };
    }

    toStringDict() {
        return {
            userid: String(this.userid),
            tasktext: String(this.tasktext),
            addtocal: String(this.addtocal),
            priority: String(this.priority),
            startdatetime: this.startdatetime?.toISOString?.() || String(this.startdatetime),
            enddatetime: this.enddatetime?.toISOString?.() || String(this.enddatetime),
            donestatus: String(this.donestatus),
            donestatus_datetime: this.donestatus_datetime?.toISOString?.() || String(this.donestatus_datetime),
            remarks: String(this.remarks),
            addedby_userid: String(this.addedby_userid),
            addedby_datetime: this.addedby_datetime?.toISOString?.() || String(this.addedby_datetime),
            uniqueidentifyer: String(this.uniqueidentifyer),
            taskack: String(this.taskack),
            taskack_datetime: this.taskack_datetime?.toISOString?.() || String(this.taskack_datetime)
        };
    }

    static fromStringDict(strData) {
        return new MainTasks(
            strData.userid || '',
            strData.tasktext || '',
            parseInt(strData.addtocal) || 0,
            parseInt(strData.priority) || 0,
            new Date(strData.startdatetime),
            new Date(strData.enddatetime),
            parseInt(strData.donestatus) || 0,
            new Date(strData.donestatus_datetime),
            strData.remarks || '',
            strData.addedby_userid || '',
            new Date(strData.addedby_datetime),
            strData.uniqueidentifyer || '',
            parseInt(strData.taskack) || 0,
            new Date(strData.taskack_datetime)
        );
    }


}
export { MainTasks }


class MainTaskWrapperWithAddedByName {
    constructor(maintask, added_by_name, addedby_userid) {
        this.maintask = maintask;
        this.added_by_name = added_by_name;
        this.addedby_userid = addedby_userid;
    }

    static fromDict(data) {
        return new MainTaskWrapperWithAddedByName(
            MainTasks.fromDict(data.maintask),
            data.added_by_name,
            data.addedby_userid || ''
        );

    }

    toDict() {
        return {
            maintask: this.maintask ? this.maintask.toDict() : null,
            added_by_name: this.added_by_name,
            addedby_userid: this.addedby_userid
        };
    }
}
export { MainTaskWrapperWithAddedByName }






