/**
 * Created by noamc on 11/22/15.
 */

var bio = require("./bio.js").Bio;

var server = new bio(9009);

server.on("connection", function (client) {
    client.on("Hi", function (meta, buf, cb) {
        console.log(meta);
        console.log(buf.length);
        cb({Hello: "Friend"});
    });
    client.on("Whats Up?", function (meta, buf, cb) {
        console.log(meta);
        console.log(buf.length);
        cb({Hi: "Hello to you to!"});
    });
});