/**
 * Created by noamc on 11/26/15.
 */
$(function(){

    var bio = new Bio("ws://localhost:9009",{packetSize:10});

    bio.on("open", function () {
        var ab = new ArrayBuffer(2);
        var uint8 = new Uint8Array(ab);
        uint8[0] = 10;
        uint8[1] = 11;

        var f64 = new Float64Array(7);
        f64[0] = 12.15;
        f64[6] = 0.100;

        var stream = bio.createStream({something: 123});

        stream.call("Hi",{m:"hi",x: 1},uint8,function (args,bioS) {
            log(args);
            bioS.on("client?",function(meta,data,cb){
                log(meta);
                log(data);
                cb({what:"cb from client",x:args.x+1});
            });
        });

        stream.call("Whats Up?",{foo:"bar"},f64,function (args,bioS) {
            log(args);
        });

        stream.call("mixed array",{},[17,true,3.12,"a","b","c",{i:"a",j:10}],function (args,bioS) {
            log(args);
        });
    });

    window.log = function (message) {
        console.log(message);
        var line =$("<div class='line'>" + ((typeof message == 'object')? JSON.stringify(message):message) + "</div>");
        hljs.highlightBlock(line[0]);
        $("#log").append(line);
    }
});