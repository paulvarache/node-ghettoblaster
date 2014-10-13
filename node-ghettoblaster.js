var cp = require('child_process'),
    events = require('events'),
    readline = require('readline'),
    spawn = cp.spawn,
    exec = cp.exec;

function GBlaster(path){
    this.childProc = null;
    this.file = path;
    this.playing = false;
    this.rl = null;
    this.duration = null;
    this.pausedPos = null;

    events.EventEmitter.call(this);

    exec('mplayer', function(err, stdout, stdin){
        if(err)
            throw new Error("GBlaster encountered an error or isn't installed.");
    });
};

GBlaster.prototype.__proto__ = events.EventEmitter.prototype;

GBlaster.prototype.play = function(opts, callback) {
    if (this.childProc !== null) return this.resume();             // The process is already running, we just resume the playing
    var args = ['-slave', '-quiet', '-idle', "-really-quiet", '-msglevel', 'statusline=6', '-msglevel', 'global=6', this.file];

    this.childProc = spawn('mplayer', args);

    if(typeof opts !== 'undefined'){
        if(typeof opts.volume !== 'undefined')
            this.setVolume(opts.volume);

        if(typeof opts.loop !== 'undefined')
            this.setLoop(opts.loop);
    }

    this.childProc.on('error', (function(error){
        this.emit('error');
    }).bind(this));

    this.childProc.stdout.on('data', (function (data) {
        if (data.toString().indexOf("EOF") !== -1) {
            this.emit('ended');
        }
    }).bind(this));

    this.childProc.on('exit', (function(code, sig){
        this.childProc = null;
    }).bind(this));

    this.rl = readline.createInterface({
        input: this.childProc.stdout,
        output: this.childProc.stdin
    });

    this.playing = true;
    this.emit('started');
};

GBlaster.prototype.write = function (cmd) {
    if(this.childProc !== null){
        this.childProc.stdin.write(cmd);
    }
}

GBlaster.prototype.stop = function() {
    if(this.childProc !== null){
        cp.exec("killall mplayer"); //Not really nice but works better than .kill('SIGINT')
        this.emit('stopped');
    }
};

GBlaster.prototype.toggle = function () {
    this.write('pause\n');
    this.playing = !this.playing;
    this.emit(this.playing ? "resumed" : "paused");
}

GBlaster.prototype.pause = function() {
    if (this.playing) {
        this.getTimePosition((function (err, pos) {
            console.log(pos);
            this.lastPos = pos;
            this.toggle();
        }).bind(this));
    }
};

GBlaster.prototype.resume = function () {
    if (!this.playing) this.toggle();
}

GBlaster.prototype.mute = function() {
    this.write('mute\n');
    this.emit('muted');
};

GBlaster.prototype.setVolume = function(volume) {
    this.write('volume ' + volume + ' 1\n');
};

GBlaster.prototype.seek = function(sec) {
    this.write('seek ' + sec + ' 2\n');
};

GBlaster.prototype.setLoop = function(times) {
    this.write('loop ' + times + '\n');
};

GBlaster.prototype.setSpeed = function(speed) {
    this.write('speed_set ' + speed + '\n');
};

GBlaster.prototype.getValue = function (value, callback) {
    callback = callback || function () {}
    if (this.childProc !== null) {
        var question = this.playing ? "" : "pausing ";
        question += "get_property ";
        question += value;
        this.rl.question(question + "\n", (function (answer) {
            var s = answer.split("=");
            if (s[1] && s[0] === "ANS_"+value) {
                callback(null, s[1]);
            } else {
                setTimeout(this.getValue.bind(this, value, callback), 10); // Ugly hack to avoid shitty output from mplayer
            }
        }).bind(this));
    }
}

GBlaster.prototype.getPercentPos = function (callback) {
    this.getValue("percent_pos", callback);
};

GBlaster.prototype.getTimeLength = function(callback) {
    if (this.duration !== null)
        return callback(null, this.duration);
    if (!this.playing)
        return callback(null, 0);
    this.getValue("length", (function (err, length) {
        if (!err)
            this.duration = length;
        callback(err, length)
    }).bind(this));
};

GBlaster.prototype.getTimePosition = function(callback) {
    if (!this.playing && this.pausedPos !== null) {
        return callback(null, this.pausedPos);
    }
    this.getValue("time_pos", callback);
};

module.exports = GBlaster;
