require("../css/index.scss");
const devMode = process.env.NODE_ENV !== 'production';

let self;

class Buffer {
    constructor(context, urls) {
        this.context = context;
        this.urls = urls;
        this.buffer = [];
    }
    loadingSound(url, index) {
        let request = new XMLHttpRequest();
        request.open("get", url, true);
        request.responseType = "arraybuffer";
        let thisBuffer = this;
        request.onload = function() {
            thisBuffer.context.decodeAudioData(request.response, function(
                buffer
            ) {
                thisBuffer.buffer[index] = buffer;
                if (index == thisBuffer.urls.length - 1) {
                    thisBuffer.loaded();
                }
            });
        };
        request.send();
    }

    loadAll() {
        this.urls.forEach((url, index) => {
            this.loadingSound(url, index);
        });
    }

    loaded() {
        document.getElementsByClassName("container-footer")[0].style.display = "none";
		document.getElementById("start").innerText = "Start";
		document.getElementById("start").classList.remove("disabled");
    }

    getSoundByIndex(index) {
        return this.buffer[index];
    }
}

class Sound {
    constructor(context, buffer) {
        this.context = context;
        this.buffer = buffer;
    }

    init() {
        this.gainNode = this.context.createGain();
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);
        this.gainNode.gain.setValueAtTime(0.8, this.context.currentTime);
    }

    play() {
        this.init();
        this.source.start(this.context.currentTime);
        console.log(this.context.currentTime);
    }

    stop() {
        this.gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            this.context.currentTime + 0.5
        );
        this.source.stop(this.context.currentTime + 0.5);
    }
}

let audioBase = devMode ? "http://localhost:9000/audio/daftpunkmix.mp3" : "https://camiloarguello.xyz/audio/daftpunkmix.mp3"

var sounds = [
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/1.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/2.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/3.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/4.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/5.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/6.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/7.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/8.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/9.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/10.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/11.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/12.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/13.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/14.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/15.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/16.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/after.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/better.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/do it.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/never.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/faster.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/harder.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/hour.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/make it.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/makes us.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/more than.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/ever.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/our.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/over.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/stronger.wav",
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/work is.wav",
    audioBase
];

class Game {
    init() {
        self = this;
        this.game = "";
        this.frames = [];
        this.framesNames = [];
        this.changeSection = this.changeSection.bind(this);
        this.removeTransition = this.removeTransition.bind(this);
		this.playSounds = this.playSounds.bind(this);
		this.takeTest = this.takeTest.bind(this);
		this.restartGame = this.restartGame.bind(this);

        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.buffer = new Buffer(this.context, sounds);
		this.buffer.loadAll();
        this.isBaseLoaded = false;
        
        

		this.eventListener();
    }
    eventListener() {
        this.game = this.setupSteps(document.getElementById("Birthday"));

        // Start Button
        let startButton = document.getElementById("start");
        startButton.addEventListener("click", () => {
            this.initHarderBetter();
        });

        let keys = document.querySelectorAll(".key");
		keys.forEach(key => {
				key.addEventListener("transitionend", this.removeTransition)
				key.addEventListener("click",this.playSounds)
		});
	}
	// For handle movements between sections
    setupSteps(gameDiv) {
        for (var i = 0; i < gameDiv.childNodes.length; i++) {
            var id = gameDiv.childNodes[i].id;
            if (id != undefined) {
                var child = gameDiv.childNodes[i];
                if (child.classList.contains("frame")) {
                    this.frames[id] = child;
                    this.framesNames.push(id);
                }
            }
        }
        function setFrameVisible(name) {
            self.frames[name].classList.remove("hidden");
            self.frames[name].classList.add("visible");
        }
        function setFrameHidden(name) {
            self.frames[name].classList.remove("visible");
            self.frames[name].classList.add("hidden");
        }
        return {
            setFrameVisible: setFrameVisible,
            setFrameHidden: setFrameHidden
        };
    }
    changeSection(prev, next) {
        document.getElementsByClassName("thomas")[0].classList.add("active");
        document.getElementsByClassName("guy")[0].classList.add("active");
        document.getElementsByTagName("splash")[0].classList.add("hideCont");
        document.getElementById("start").classList.add("hideBoton");

        setTimeout(() => {
            this.game.setFrameHidden(prev);
            this.game.setFrameVisible(next);
        }, 3000);
	}
	// Activate events of Game
    initHarderBetter() {
        this.changeSection("introduction", "gameTwo");
		window.addEventListener("keydown", this.playSounds);

        document.getElementById("test-play").addEventListener("click",this.takeTest);

		document.getElementById("restart").addEventListener("click",this.restartGame);				
    }
    playSounds(e) {
        var dataKey = document.querySelectorAll(
            '[data-key="' + e.keyCode + '"]'
		);
		var elem = e.target.closest("div");
        if (dataKey.length > 0 || elem) {
			var key, index;

			// If event comes from keypressed
			// Or if it was by click
			if(dataKey.length > 0){
				key = dataKey[0];
				index = parseInt(key.attributes[0].value);
			}else{
				key = elem;
				index = parseInt(elem.getAttribute("data-sound"));
				
				// Deactivate button
				setTimeout(() => {
					elem.classList.remove("playing");
				}, 100);
			}

            var sound = new Sound(
                this.context,
                this.buffer.getSoundByIndex(index)
            );
            key.classList.add("playing");
			sound.play();
		}
    }
    removeTransition(e) {
        if (e.propertyName !== "transform") return; // skip it if it's not a transform
		e.target.classList.remove("playing");
		

		setTimeout(() => {
			let keys = document.querySelectorAll(".key");
			keys.forEach(key => {
				key.classList.remove("playing");
			});
		}, 3000);
	}
	takeTest(){
		// To handle only one click preventing many sounds
		if(!this.isBaseLoaded){
			var baseSound = new Sound(
				this.context,
				this.buffer.getSoundByIndex(sounds.length - 1)
			);
	
			var counter = 6;
			var startBaseSound = setInterval(function(){
			
			document.getElementsByClassName("counter")[0].classList.remove("hidden");
			document.getElementById("counter-text").innerText = counter;
	
			counter--;
			if (counter === 0) {
				baseSound.play();
				document.getElementsByClassName("counter")[0].classList.add("hidden");
				clearInterval(startBaseSound);
			}
			}, 1000);
		}
	
		this.isBaseLoaded = true;
	}
	restartGame(){
		location.reload(false);
	}
}

const game = new Game();
game.init();
