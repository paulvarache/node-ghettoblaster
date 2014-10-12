Node Ghettoblaster
============

A Node.js music player. It uses mplayer in slave mode and send controls via the stdin.

##Usage

Install the module (You must have mplayer on your system)

	npm install node-ghettoblaster

Create objects with the file you want to be played as argument.

```Javascript

	var GBlaster = require('node-ghettoblaster');

	var player1 = new GBlaster('/home/platypus/Music/Eminem - Rap God (explicit).mp3');
    var player2 = new GBlaster('http://mysongwebsite/song/Sound%20of%20Silence.mp3');

```

##Available methods

###play

The first method to call after instanciation (Calling other ones will do nothing ;) ).
It will start playing if called the first time and resume if the music was paused before.
You can specify the volume and the number of time the music will be played with the **volume** and **loop** options

```JavaScript

	player.play();
    player.play({volume: 50});
    player.play({volume: 50,
    			loop: 10});

```

###stop

This method will stop the played file.

```JavaScript
	player.stop();
```

###pause

This one will pause if playing.

```JavaScript
	player.pause();
```

###resume

This one will resume if paused.

```JavaScript
	player.pause();
```

###toggle

This one will toggle pause.

```JavaScript
	player.toggle();
```

###mute

The method to toggle mute

```JavaScript
	player.mute();
```

###setVolume

This method is used to set the volume. It takes one parameter, the volume value that can go from 1 to 100.

```JavaScript
	player.setVolume(52);
```

###seek

This method is used to navigate in the playing file. It take one parameter, the seek value in seconds that goes from 0 to the end of the file. This value is absolute.

```JavaScript
	player.seek(50);    //will go to 50 seconds
```

###setLoop

This will set the number of times to replay the file. The parameter is the number of times, -1 is forever.

```JavaScript
	player.setLoop(20);
```

###setSpeed

This will set the playing speed. It takes one parameter, the speed. 1 is the default speed.

```JavaScript
	player.setSpeed(0.5);    //will play the file 0.5x slower
    player.setSpeed(20);    //will play the file 20x faster
```

###getTimeLength

Returns the length of the file in seconds. It needs a callback.

```JavaScript
	player.getTimeLength(function(length){
    	console.log(length);
    });
```

###getTimePosition

Returns the elapsed play time in seconds. It needs a callback.

```JavaScript
	player.getTimePosition(function(elapsedTime){
    	console.log(elapsedTime);
    });
```

##Events

I won't explain those events, the names are quite explicit

* play
* paused
* resumed
* stopped
* muted
* end
* error

Do whatever you want with this module, I don't care.
