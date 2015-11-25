/**
 * Created by noamc on 11/22/15.
 */

var bio = require("./bioserver.js").Bio;

var server = new bio({port:9009,packetSize:10});

server.on("connection", function (client) {
    client.on("stream",function(stream){

        stream.on("Hi", function (meta, buf, cb) {
            console.log(meta);
            console.log(buf);
            cb({Hello: "Friend",x:meta.x+1},function(args,bioStream){
                var int8 = new Int8Array([1,2,3,10]);
                bioStream.call("client?",{z:"foo"},int8,function(args){
                    console.log(args);
                });
            });
        });

        stream.on("Whats Up?", function (meta, buf, cb) {
            console.log(buf);
            cb({Hi: "Hello to you too!"},function(args,bioStream){

            });
        });

        stream.on("mixed array", function (meta, buf, cb) {
            console.log(buf);
            cb({array: "got it"},function(args,bioStream){

            });
        });
    });
});