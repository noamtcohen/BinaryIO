/**
 * Created by noamc on 11/25/15.
 */
function Test(){
    BasicEmitter(this,Test);
}

var t = new Test();

var cb = function(s){
    log(s);
};

t.on("what",cb);
t.on("hi",cb)
t.once("hi",cb);
t.once("hi",cb);

t.on("removeListener",function(name,cb){
    log("remove: '" +name + "' " + cb);
});

t.removeAllListeners(["hi"]);

t.removeListener("what",cb);

t.emit("hi","hi 1");
t.emit("hi","hi 2");


t.emit("what","???");