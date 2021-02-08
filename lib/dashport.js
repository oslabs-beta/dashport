"use strict";
/*
* import Authenticate from Authenticate.ts
*/
exports.__esModule = true;
var dep_ts_1 = require("../dep.ts");
console.log(dep_ts_1.Application);
var Dashport = /** @class */ (function () {
    /**
     * 'Dashport' constructor
     */
    function Dashport() {
        //some shit 
        return;
    }
    /**
     * method: initialize
     * @param: the string of which framework the client wants to use
     * @return: nothing
     */
    // needs to connect to framework (what exactly does that entail?)
    // also checks to see if there is an existing session
    // onyx appends methods to the passed-in state, then checks for a userID and deserializes and returns their info
    Dashport.prototype.initialize = function (clientStr, context) {
        var oakInitialize = function (ctx, next) {
            // if request contains a session and we have a valid key for that session, apply it
        };
        // could have different closure functions for different frameworks, 
        // and we can return the invocation of whichever based on the clientStr
        // where do we get the ctx and next? 
        if (clientStr === 'oak')
            return oakInitialize(context, context.next);
    };
    /**
     * method: authenticate
     * the actual authenticate function (in Authenticate.ts) redirects
     * the user to log in with OAuth. This function give the client access
     * to a version of that function tailored to their strategy and framework
     * @param: strategyName
     * @param: options (tokens and keys needed for OAuth)
     * @return: nothing
     */
    Dashport.prototype.authenticate = function (strategyName) {
        // perform the necessary logic to the authenticate method from authenticate.ts
    };
    /**
     * method: use
     * @param: an invocation of the imported strategy; need to determine type
     * @return: your own worst fears
     */
    Dashport.prototype.use = function (strategy) {
        //if strategy is not passed in, throw Err
        // this._strategies[stratName] = strategy;
        return 'placeholder';
    };
    /**
     * method: unUse
     * @param: the name of the strategy you want to remove
     * @return: theresa may
     */
    Dashport.prototype.unUse = function (strategyName) {
        // delete this.strategies[strategyName]
        // return this
        return 'placeholder';
    };
    /**
     * method: getUserInfo
     * @param: the serialized id that comes from serializeUser
     * @return: the user's information
     */
    Dashport.prototype.getUserInfo = function (serialId) {
        return '!';
    };
    return Dashport;
}());
exports["default"] = Dashport;
