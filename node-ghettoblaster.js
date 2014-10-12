var cp = require('child_process'),
    events = require('events'),
    readline = require('readline'),
    spawn = cp.spawn,
    exec = cp.exec;

function GBlatser(path){
    this.childProc = null;
    this.file = path;
    this.playing = false;
    this.rl = null;

    events.EventEmitter.call(this);

    exec('mplayer', function(err, stdout, stdin){
        if(err)
            throw new Error("GBlatser encountered an error or isn't installed.");
    });
};

GBlatser.prototype.__proto__ = events.EventEmitter.prototype;

GBlatser.prototype.play = function(opts) {
    if (this.childProc !== null) return this.resume();             // The process is already running, we just resume the playing
    var args = ['-slave', '-quiet', '-idle', this.file];

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
        if (data.toString() === "\n") this.emit("ended")
    }).bind(this));

    this.childProc.on('exit', (function(code, sig){
        this.childProc = null;
    }).bind(this));

    this.rl = readline.createInterface({
        input: this.childProc.stdout,
        output: this.childProc.stdin
    });
};

GBlatser.prototype.write = function (cmd) {
    if(this.childProc !== null){
        this.childProc.stdin.write(cmd);
    }
}

GBlatser.prototype.stop = function() {
    if(this.childProc !== null){
        cp.exec("killall mplayer"); //Not really nice but works better than .kill('SIGINT')
        this.emit('stopped');
    }
};

GBlatser.prototype.toggle = function () {
    this.write('pause\n');
    this.playing = !this.playing;
    this.emit(this.playing ? "resumed" : "paused");
}

GBlatser.prototype.pause = function() {
    if (this.playing) this.toggle();
};

GBlatser.prototype.resume = function () {
    if (!this.playing) this.toggle();
}

GBlatser.prototype.mute = function() {
    this.write('mute\n');
    this.emit('muted');
};

GBlatser.prototype.setVolume = function(volume) {
    this.write('volume ' + volume + ' 1\n');
};

GBlatser.prototype.seek = function(sec) {
    this.write('seek ' + sec + ' 2\n');
};

GBlatser.prototype.setLoop = function(times) {
    this.write('loop ' + times + '\n');
};

GBlatser.prototype.setSpeed = function(speed) {
    this.write('speed_set ' + speed + '\n');
};

GBlatser.prototype.getTimeLength = function(callback) {
    if(this.childProc !== null){
        this.rl.question("get_time_length\n", function(answer) {
            callback(answer.split('=')[1]);
        });
    }
};

GBlatser.prototype.getTimePosition = function(callback) {
    if(this.childProc !== null){
        this.rl.question("get_time_pos\n", function(answer) {
            callback(answer.split('=')[1]);
        });
    }
};

module.exports = GBlatser;
