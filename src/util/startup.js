/**
 * Created by r1cebank on 8/19/15.
 */

/*!
 *  After bootstrap, all the necessary promises, values are defined in AppSingleton
 *  In startup.js we will begin loading the appropriate routes, settings
 */

import AppSingleton     from './appsingleton';
import Promise          from 'bluebird';

function startup() {

    //  Log tag
    var TAG = "startup";

    //  This instance is shared across the entire app life-cycle
    var sharedInstance = AppSingleton.getInstance();

    return new Promise((resolve) => {
        sharedInstance.app.post('/upload', sharedInstance.upload.single('file'), function(req, res, next) {
            console.log(req.file);
            res.send(req.file);
        });
        resolve({ });
    });

}
export default startup;