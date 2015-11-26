/**
 * Created by noamc on 11/24/15.
 */

(function(exports){
    exports.BasicEmitter = function(target,type){
        if(target.constructor != type)
            throw "Please construct " + type.name + " with new keyword";

        target._listeners = {};
        target.on = function(name,cb,once){
            target.emit("newListener",name,cb);

            if(!target._listeners[name])
                target._listeners[name] = [];

            target._listeners[name].unshift({fun:cb,once:once||false});
        }

        target.once = function(name,cb){
            target.on(name,cb,true);
        }

        target.emit=function(){
            var args = toArray(arguments);

            var name = args[0];

            var eventArray = getEventArray(name);
            if(!eventArray)
                return;

            var toApply = args.slice(1);
            for (var i = eventArray.length-1; i>=0;i--){
                var eInfo=eventArray[i];
                eInfo.fun.apply(null,toApply);
                if(eInfo.once)
                    eventArray.splice(i,1);
            }
        }

        target.listenerCount = function(e){
            var eventArray = getEventArray(e);
            if(!eventArray)
                return 0;

            return eventArray.length;
        }

        target.removeAllListeners = function(names){
            if(typeof names === "string")
                names = [names];

            for(var i=0;i< names.length;i++)
               remove(names[i]);

            function remove(name){
                var eventArray = getEventArray(name);
                if(!eventArray)
                    return;

                for(var i=eventArray.length-1;i>=0;i--){
                    var cb=eventArray[i].fun;
                    removeEmitRemove(i,name,cb);
                }

                delete eventArray;
            }
        }

        target.removeListener = function(name,cb){
            var eventArray = getEventArray(name);
            if(!eventArray)
                return;

            for(var i=eventArray.length-1;i>=0;i--)
                if(eventArray[i].fun == cb)
                   removeEmitRemove(i,name,cb);
        }

        function removeEmitRemove(index,name,cb){
            var eventArray = getEventArray(name);

            eventArray.splice(index,1);
            target.emit("removeListener",name,cb);
        }

        function getEventArray(name){
            return target._listeners[name];
        }

        function toArray(obj){
            var rtn = [];
            for(var key in obj)
            {
                if (!obj.hasOwnProperty(key))
                    continue;

                var index = parseInt(key);
                rtn[index] = obj[key];
            }
            return rtn;
        }
    }
})((typeof exports!=="undefined")?exports:window);