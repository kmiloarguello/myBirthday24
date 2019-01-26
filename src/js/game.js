require("../css/index.scss");

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
        console.log("Loaded");
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
    }

    stop() {
        this.gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            this.context.currentTime + 0.5
        );
        this.source.stop(this.context.currentTime + 0.5);
    }
}

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
    "../audio/daftpunkmix.mp3"
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

        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.buffer = new Buffer(this.context, sounds);
        this.buffer.loadAll();

        this.eventListener();
    }
    eventListener() {
        this.game = this.setupSteps(document.getElementById("Birthday"));

        // Start Button
        let startButton = document.getElementById("start");
        startButton.addEventListener("click", () => {
            this.changeSection("introduction", "gameTwo");
        });

        let keys = document.querySelectorAll(".key");
        keys.forEach(key =>
            key.addEventListener("transitionend", this.removeTransition)
        );
        window.addEventListener("keydown", this.playSounds);

    }
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
        this.game.setFrameHidden(prev);
        this.game.setFrameVisible(next);
    }
    playSounds(e) {
        var dataKey = document.querySelectorAll(
            '[data-key="' + e.keyCode + '"]'
        );
        if (dataKey.length > 0) {
            var key = dataKey[0];

            var index = parseInt(key.attributes[0].value);

            var sound = new Sound(this.context, this.buffer.getSoundByIndex(index));
            key.classList.add("playing");
            sound.play();
        }
    }
    removeTransition(e) {
        if (e.propertyName !== "transform") return; // skip it if it's not a transform
        e.target.classList.remove("playing");
    }
}

const game = new Game();
game.init();
