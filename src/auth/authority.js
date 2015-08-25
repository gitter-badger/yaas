/**
 * Created by r1cebank on 8/24/15.
 */

/*!
 *  This is the authority file, which handles all authority in the app
 *  it will load the appropriate handling functions based on the type
 */

import  AppSingleton        from '../util/appsingleton';
import  _                   from 'lodash';

class Authority {

    //  Constructor will load the appropriate methods based on type
    constructor(type) {
        //  Log tags
        this.TAG = `authority:${type}`;
        //  Supress warnings
        this.checkauth = (a) => {AppSingleton.getInstance().L.error(this.TAG, `this should not be printed`);};
        this.checkrole = (u) => {AppSingleton.getInstance().L.error(this.TAG, `this should not be printed`);};

        AppSingleton.getInstance().L.info(this.TAG, `loading modules`);

        _.assign(this, require(`./${type}/checkauth.js`));
        _.assign(this, require(`./${type}/checkrole.js`));
        AppSingleton.getInstance().L.info(this.TAG, `modules loading complete`);
    }

    ///*!
    // *  For Express, we added these functions to help the authenticate
    // *  This also need to be a Express middleware
    // */
    //authenticate(req, res) {
    //
    //    //  To make sure we always have the auth field, we need to combine all the request params
    //    var request = _.extend(req.params || {}, req.query || {}, req.body || {});
    //
    //    //  Checkath will return the user if login correct or return undefined if error occured
    //    var user = this.checkauth(request.auth);
    //    console.log(user)
    //    if(!user) {
    //        res.status(403).send({error: `auth failed for ${this.TAG}`});
    //        return false;
    //    } else {
    //        return true;
    //    }
    //}

    /*!
     *  After authenticate is finished running, we need to check if the user is authenticated for that role
     */
    hasRole(req, res, role) {

        //  To make sure we always have the auth field, we need to combine all the request params
        var request = _.extend(req.params || {}, req.query || {}, req.body || {});

        //  Check if overwrite exist for this role, if exist, overwrite the checkauth and check role function
        if(AppSingleton.getInstance().auth.overwrites[role]) {

            //  Get overwrite auth type
            var type = AppSingleton.getInstance().auth.overwrites[role];
            AppSingleton.getInstance().L.warn(this.TAG, `overwrite auth method to ${type}`);
            this.checkauth = require(`./${type}/checkauth.js`).checkauth;
            this.checkrole = require(`./${type}/checkrole.js`).checkrole;
        }

        //  Checkath will return the user if login correct or return undefined if error occured
        try {
            var user = this.checkauth(request.auth);
        } catch (e) {
            res.status(400).send({error: e});
            return false;
        }


        if(!user) {
            res.status(403).send({error: `auth failed for ${this.TAG}`});
            return false;
        } else {
            if(!this.checkrole(user, role)) {
                res.status(403).send({error: `${request.auth} not permitted for ${role}`});
                return false;   //  We still need to return since the value will be used to wrapped in if
            } else {
                return true;
            }
        }
    }
}

export default Authority;