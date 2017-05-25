var mongoclient = require('mongodb').MongoClient;

function my_mongo(url) {
    var _db = null;

    function get_db(cb) {
        if (_db) {
            return cb(null, _db);
        } else {
            mongoclient.connect(
                url,
                (err, db) => {
                    if (err) {
                        _db = null;
                        console.log('DB connect error');
                        console.log(err);
                        return cb(err);
                    } else {
                        _db = db;
                        console.log('DB connect ok');
                        cb(null, _db);
                    }
                }
            )
        }
    }

    return function() {
        get_db((err, db) => {
            if (err) {
                return null;
            } else {
                return db;
            }
        });
    }
}

module.exports = my_mongo;