import Users from './Users';
class Token {
    constructor(access_token, token_type, tokenCreateDateTime, username, username_loggedin) {
        this.access_token = access_token; // string
        this.token_type = token_type; // string, e.g., "Bearer"
        this.tokenCreateDateTime = tokenCreateDateTime; // should be a Date object   
        this.username = username;
        this.username_loggedin = username_loggedin
    }

    static fromDict(data) {
        return new Token(
            data.access_token || '',
            data.token_type || 'bearer',
            new Date(data.user_createDatetime) || new Date(),
            data.username || '',
            data.username_loggedin || '',
        );

    }
    toDict() {
        return {
            access_token: this.access_token,
            token_type: this.token_type,
            tokenCreateDateTime: this.tokenCreateDateTime,
            username: this.username,
            username_loggedin: this.username_loggedin
        };
    }


}
export default Token;

class UserNToken {
    constructor(user, token) {
        this.user = user // this is objec of  User class
        this.token = token // this is objec of  Token class
    }

    static fromDict(data) {
        const token = Token.fromDict(data.token || {});
        const user = Users.fromDict(data.user || {});
        return new UserNToken(user, token);
    }


    toDict() {
        return {
            "user": this.user.toDict(),
            "token": this.token.toDict(),
        };

    }


}
export { UserNToken };