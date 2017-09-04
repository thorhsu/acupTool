var async = require("async");
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require('mongodb').ObjectID;
module.exports = function(mongodbUri,collectionName) {
    var cache;
    var serverVersion;
    function asyncrun(callback) {
        async.waterfall([
            function(next) {
                if (!cache) {                    
                    MongoClient.connect("mongodb://thorhsu:12sqh38j@ds149743.mlab.com:49743/members", function(err, db) {
                        if (!err) {
                            cache = db;
                            next(null,cache);
                        } else {
                            next(err,null);
                        }
                    });
                } else {
                    next(null,cache);
                }
            },
            function(db, next) {
                // if (!serverVersion) {
                //     db.admin().serverStatus(function(err, info) {
                //         if (!err) {
                //             serverVersion = info.version;
                //             next(null, db);
                //         } else {
                //             next(err, null);
                //         }
                //     });
                // } else {
                //     next(null, db);
                // }
                serverVersion = "3.4";
                next(null, db);
            }
        ],function(err,db) {
            console.log(db);
            callback(err,db && db.collection(collectionName));
            console.log("fiinished call");
        });
    }
    this.insert = function(insertObject,success,error) {
        asyncrun(function(err,dbc) {
            if (!err) {
                dbc.insert(insertObject, function(err, result) {
                    if (!err) {
                        if (success) success(result);
                    } else {
                        if (error) error(err);
                    }
                });
            } else {
                if (error) error(err);
            }
        });
    }
    this.select = function(filter,success,error,fetch) {
        asyncrun(function(err,dbc) {
            if (!err) {
                if (typeof filter !== "function") {
                    if (!filter) {
                        filter = {};
                    }

                    var q = dbc.find(filter);
                    if (serverVersion>="3.2" && filter.$orderby) {
                        q = q.sort(filter.$orderby);
                    }
                    if (fetch) {
                        q = q.limit(fetch);
                    }
                } else {
                    q = filter(dbc);
                }
                q.toArray(function(err,data) {
                    if (!err) {
                        if (success) success(data);
                    } else {
                        if (error) error(err);
                    }
                });
            } else {
                if (error) error(err);
            }
        });
    }
    this.update = function(id,updateObject,success,error) {
        asyncrun(function(err,dbc) {
            if (!err) {
                if (!updateObject.$set && !updateObject.$unset) {
                    updateObject = {$set:updateObject};
                }
                dbc.update({_id: new ObjectId(id)},updateObject,function(err,data) {
                    if (!err) {
                        if (success) success(data);
                    } else {
                        if (error) error(err);
                    }
                });
            } else {
                if (error) error(err);
            }
        });
    }
    this.remove = function(id,success,error) {
        asyncrun(function(err,dbc) {
            if (!err) {
                dbc.remove({_id: new ObjectId(id)},function(err,data){
                    if (!err) {
                        if (success) success(data);
                    } else {
                        if (error) error(err);
                    }
                });
            } else {
                if (error) error(err);
            }
        });
    }
    this.id = function(id) {
        return new ObjectId(id);
    }
}