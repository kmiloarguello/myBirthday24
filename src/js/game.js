class Buffer {
    constructor(context, urls) {
        this.context = context;
        this.urls = urls;
        this.buffer = [];
    }
    loadingSound(url, index) {
        var request = new XMLHttpRequest();
        request.open("get", url, true);
        request.responseType = "arraybuffer";

        var thisBuffer = function() {
            this.buffer.context.decodeAudioData(request.response, function(
                buffer
            ) {
                thisBuffer.buffer[index] = buffer;
                //updateProgress(thisBuffer.urls.length);

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

    loaded() {}

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
function playSound(e) {
    // const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
    // const key = document.querySelector(`.key[data-key="${e.keyCode}"]`);
    // if (!audio) return; // stop the function from running all together
    // audio.currentTime = 0; // rewind to the start
    // audio.play();
    // key.classList.add('playing');
    var context = new (window.AudioContext || window.webkitAudioContext)();

    var buffer = new Buffer(context, [
        "https://s3-us-west-2.amazonaws.com/s.cdpn.io/327091/11.wav"
    ]);
    buffer.loadAll();

    var sound = new Sound(context, buffer.getSoundByIndex(0));
    sound.play();

    console.log(buffer.getSoundByIndex(0));
}
//   function removeTransition(e) {
//     if (e.propertyName !== 'transform') return; // skip it if it's not a transform
//     this.classList.remove('playing');
//   }

const keys = document.querySelectorAll(".key");
// keys.forEach(key => key.addEventListener('transitionend', removeTransition));
window.addEventListener("keydown", playSound);
