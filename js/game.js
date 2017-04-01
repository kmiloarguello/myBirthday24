var game;
window.addEventListener("load", function (){
  game = new Juego(document.getElementById("Birthday"));
  document.body.className += " overflows";
},false);


function Juego(gameDiv){
  var frames = [];
  var framesNames = [];

  for (var i = 0; i < gameDiv.childNodes.length ; i++) //accedemos al array desde los hijos de class"juego"
  {
    var id = gameDiv.childNodes[i].id;
    if(id != undefined)
    {
        var child = gameDiv.childNodes[i];
        if (child.classList.contains("frame"))
        {
          frames[id] = child;
          framesNames.push(id);
        }
    }
  }
  function setFrameVisible(name)
  {
    frames[name].classList.remove("hidden");
    frames[name].classList.add("visible");
  }
  function setFrameHidden(name)
  {
    frames[name].classList.remove("visible");
    frames[name].classList.add("hidden");
  }
  return {
      "setFrameVisible": setFrameVisible,
      "setFrameHidden": setFrameHidden
  };
}

setTimeout(function(){
  cambioSection('pre-loading','escenario');
},2000);


function quitarClase(){
  $("body").removeClass("overflows");
}
// window.onload = toggleAudio;
function toggleAudio(){
  var a = document.getElementById("main-audio");
  a.play();
}
function pauseAudio(){
  var b = document.getElementById("main-audio");
  b.pause();
}

function cambioSection(entrada,salida){
  var myDiv = document.getElementById('cambio-section');
  myDiv.style.display = 'block';

  var count = 2;
  var contador = setInterval(timer,1000);

  function timer(){
    count-=1;
    if(count <= 0){
      clearInterval(contador);
      myDiv.style.display = 'none';

      return;
    }
  }

  game.setFrameHidden(entrada);
  game.setFrameVisible(salida);

}

function openCarousel(){
  $('.carousel').carousel({fullWidth: true});
}

var BRAINYMO = BRAINYMO || {};

BRAINYMO.Game = (function() {

    var activeCards = [];
    var numOfCards;
    var cardHitCounter = 0;
    var card;
    var timer;
    var storage;

    function handleCardClick() {

        var connection = $(this).data('connection');
        var hit;

        if ( !$(this).hasClass('active') ) {
            $(this).addClass('active');
            activeCards.push($(this));

            if (activeCards.length == 2) {
                hit = checkActiveCards(activeCards);
            }

            if (hit === true) {
                cardHitCounter++;
                activeCards[0].add(activeCards[1]).unbind().addClass('wobble cursor-default');
                activeCards = [];

                if(cardHitCounter === (numOfCards / 2)) {
                    activeCards = [];
                    // Reset counter
                    cardHitCounter = 0;
                    // End game
                    endGame();
                }
            }
            // In case when user open more then 2 cards then automatically close first two
            else if(activeCards.length === 3) {
                for(var i = 0; i < activeCards.length - 1; i++) {
                    activeCards[i].removeClass('active');
                }
                activeCards.splice(0, 2);
            }
        }
    }

    function endGame() {
        timer.stopTimer();

        // Retrieve current time
        var time = timer.retrieveTime();

        // Retrieve time from storage
        var timeFromStorage = storage.retrieveBestTime();

        // if there's already time saved in storage check if it's better than current one
        if (timeFromStorage != undefined && timeFromStorage != '') {
            // if current game time is better than one saved in store then save new one
            if (time.minutes < timeFromStorage.minutes || (time.minutes == timeFromStorage.minutes && time.seconds < timeFromStorage.seconds) ) {
                storage.setBestTime(time);
            }
        }
        // else if time is not saved in storage save it
        else {
            storage.setBestTime(time);
        }

        // Update best time
        timer.updateBestTime();
    }

    function checkActiveCards(connections) {
        return connections[0].data('connection') === connections[1].data('connection');
    }

    return function(config) {

        /**
         * Main method for game initialization
         */
        this.startGame = function() {
            card = new BRAINYMO.Card();
            timer = new BRAINYMO.Timer();
            storage = new BRAINYMO.Storage();
            numOfCards = config.cards.length;
            card.attachCardEvent(handleCardClick, config);
        };

        /**
         * After game initialization call this method in order to generate cards
         */
        this.generateCardSet = function() {
            // Generate new card set
            card.generateCards(config.cards);
            // Reset active cards array
            activeCards = [];

            // Reset timer
            timer.stopTimer();
            // Set timer
            timer.startTimer();
        };

        this.startGame();
    }

})();



BRAINYMO.Card = (function () {

    // Private variables
    var $cardsContainer = $('.cards-container');
    var $cardTemplate = $('#card-template');

    /**
     * Private method
     * Take card template from DOM and update it with card data
     * @param {Object} card - card object
     * @return {Object} template - jquery object
     */
    function prepareCardTemplate (card) {
        var template = $cardTemplate
                            .clone()
                            .removeAttr('id')
                            .removeClass('hide')
                            .attr('data-connection', card.connectionID);

        // If card has background image
        if (card.backImg != '' && card.backImg != undefined) {
            template.find('.back').css({
                'background': 'url(' + card.backImg + ') no-repeat center center',
                'background-size': 'cover'
            });
        }
        // Else if card has no background image but has text
        else if (card.backTxt != '' && card.backTxt != undefined) {
            template.find('.back > label').html(card.backTxt);
        }

        return template;
    }

    /**
     * Private method
     * Method for random shuffling array
     * @param {Object} cardsArray - array of card objects
     * @return {Object} returns random shuffled array
     */
    function shuffleCards(cardsArray) {
        var currentIndex = cardsArray.length, temporaryValue, randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = cardsArray[currentIndex];
            cardsArray[currentIndex] = cardsArray[randomIndex];
            cardsArray[randomIndex] = temporaryValue;
        }

        return cardsArray;
    }

    return function() {

        /**
         * Public method
         * Prepare all cards and insert them into DOM
         * Before inserting new set of cards method will erase all previous cards
         * @param {Object} cards - array of card objects
         */
        this.generateCards = function(cards) {
            var templates = [];
            var preparedTemplate;

            // Prepare every card and push it to array
            cards.forEach(function (card) {
                preparedTemplate = prepareCardTemplate(card);
                templates.push(preparedTemplate);
            });

            // Shuffle card array
            templates = shuffleCards(templates);

            // Hide and empty card container
            $cardsContainer.hide().empty();

            // Append all cards to cards container
            templates.forEach(function(card) {
                $cardsContainer.append(card);
            });

            // Show card container
            $cardsContainer.fadeIn('slow');
        };

        /**
         * Public method
         * Attach click event on every card
         * Before inserting new set of cards method will erase all previous cards
         * @param {Function} func - function that will be invoked on card click
         */
        this.attachCardEvent = function(func) {
            $cardsContainer.unbind().on('click', '.flip-container', function() {
                func.call(this);
            });
        }
    }

})();

BRAINYMO.Timer = (function() {

    var $timer = $('.timer');
    var $seconds = $timer.find('#seconds');
    var $minutes = $timer.find('#minutes');
    var $bestTimeContainer = $timer.find('.time');


    var minutes, seconds;

    function decorateNumber(value) {
        return value > 9 ? value : '0' + value;
    }

    return function() {
        var interval;
        var storage = new BRAINYMO.Storage();

        this.startTimer = function() {
            var sec = 0;
            var bestTime;

            // Set timer interval
            interval = setInterval( function() {
                seconds = ++sec % 60;
                minutes = parseInt(sec / 60, 10);
                $seconds.html(decorateNumber(seconds));
                $minutes.html(decorateNumber(minutes));
            }, 1000);

            // Show timer
            $timer.delay(1000).fadeIn();

            this.updateBestTime();
        };

        this.updateBestTime = function() {
            // Check if user have saved best game time
            bestTime = storage.retrieveBestTime();
            if(bestTime != undefined && bestTime != '') {
                $bestTimeContainer
                    .find('#bestTime')
                    .text(bestTime.minutes + ':' + bestTime.seconds)
                    .end()
                    .fadeIn();
            }
        };

        this.stopTimer = function() {
            clearInterval(interval);
        };

        this.retrieveTime = function() {
            return {
                minutes: decorateNumber(minutes),
                seconds: decorateNumber(seconds)
            }
        };
    }
})();


BRAINYMO.Storage = (function() {

    return function() {

        /**
         * Save best time to localStorage
         * key = 'bestTime'
         * @param {Object} time - object with keys: 'minutes', 'seconds'
         */
        this.setBestTime = function(time) {
            localStorage.setItem('bestTime', JSON.stringify(time));
        };

        /**
         * Retrieve best time from localStorage
         */
        this.retrieveBestTime = function() {
            return JSON.parse(localStorage.getItem('bestTime'));
        };

    }
})();


$(function() {

        var brainymo = new BRAINYMO.Game({
            cards: [
                {
                    backImg: 'img/alesso.jpg',
                    connectionID: 1
                },
                {
                    backTxt: 'Alesso',
                    connectionID: 1
                },
                {
                    backImg: 'img/axwell-ingrosso.jpg',
                    connectionID: 2
                },
                {
                    backTxt: 'Axwell Λ Ingrosso',
                    connectionID: 2
                },
                {
                    backImg: 'img/coldplay.jpg',
                    connectionID: 3
                },
                {
                    backTxt: 'Coldplay',
                    connectionID: 3
                },
                {
                    backImg: 'img/dirtysouth.jpg',
                    connectionID: 4
                },
                {
                    backTxt: 'Dirty South',
                    connectionID: 4
                },
                {
                    backImg: 'img/drums.jpg',
                    connectionID: 5
                },
                {
                    backTxt: 'The Drums',
                    connectionID: 5
                },
                {
                    backImg: 'img/madeon.jpg',
                    connectionID: 6
                },
                {
                    backTxt: 'Madeon',
                    connectionID: 6
                },
                {
                    backImg: 'img/porter.png',
                    connectionID: 7
                },
                {
                    backTxt: 'Porter Robinson',
                    connectionID: 7
                },
                {
                    backImg: 'img/steveangello.jpg',
                    connectionID: 8
                },
                {
                    backTxt: 'Steve Angello',
                    connectionID: 8
                },
            ]
        });

        $('#btn-start').click(function() {
            brainymo.generateCardSet();
            $(this).text('Restart');
            document.getElementById("next-boton").style.display = "inline-block";
        });

    });


    /* Confetti by Patrik Svensson (http://metervara.net) */
    $(document).ready(function() {
        var frameRate = 30;
        var dt = 1.0 / frameRate;
        var DEG_TO_RAD = Math.PI / 180;
        var RAD_TO_DEG = 180 / Math.PI;
        var colors = [
            ["#df0049", "#660671"],
            ["#00e857", "#005291"],
            ["#2bebbc", "#05798a"],
            ["#ffd200", "#b06c00"]
        ];

        function Vector2(_x, _y) {
            this.x = _x, this.y = _y;
            this.Length = function() {
                return Math.sqrt(this.SqrLength());
            }
            this.SqrLength = function() {
                return this.x * this.x + this.y * this.y;
            }
            this.Equals = function(_vec0, _vec1) {
                return _vec0.x == _vec1.x && _vec0.y == _vec1.y;
            }
            this.Add = function(_vec) {
                this.x += _vec.x;
                this.y += _vec.y;
            }
            this.Sub = function(_vec) {
                this.x -= _vec.x;
                this.y -= _vec.y;
            }
            this.Div = function(_f) {
                this.x /= _f;
                this.y /= _f;
            }
            this.Mul = function(_f) {
                this.x *= _f;
                this.y *= _f;
            }
            this.Normalize = function() {
                var sqrLen = this.SqrLength();
                if (sqrLen != 0) {
                    var factor = 1.0 / Math.sqrt(sqrLen);
                    this.x *= factor;
                    this.y *= factor;
                }
            }
            this.Normalized = function() {
                var sqrLen = this.SqrLength();
                if (sqrLen != 0) {
                    var factor = 1.0 / Math.sqrt(sqrLen);
                    return new Vector2(this.x * factor, this.y * factor);
                }
                return new Vector2(0, 0);
            }
        }
        Vector2.Lerp = function(_vec0, _vec1, _t) {
            return new Vector2((_vec1.x - _vec0.x) * _t + _vec0.x, (_vec1.y - _vec0.y) * _t + _vec0.y);
        }
        Vector2.Distance = function(_vec0, _vec1) {
            return Math.sqrt(Vector2.SqrDistance(_vec0, _vec1));
        }
        Vector2.SqrDistance = function(_vec0, _vec1) {
            var x = _vec0.x - _vec1.x;
            var y = _vec0.y - _vec1.y;
            return (x * x + y * y + z * z);
        }
        Vector2.Scale = function(_vec0, _vec1) {
            return new Vector2(_vec0.x * _vec1.x, _vec0.y * _vec1.y);
        }
        Vector2.Min = function(_vec0, _vec1) {
            return new Vector2(Math.min(_vec0.x, _vec1.x), Math.min(_vec0.y, _vec1.y));
        }
        Vector2.Max = function(_vec0, _vec1) {
            return new Vector2(Math.max(_vec0.x, _vec1.x), Math.max(_vec0.y, _vec1.y));
        }
        Vector2.ClampMagnitude = function(_vec0, _len) {
            var vecNorm = _vec0.Normalized;
            return new Vector2(vecNorm.x * _len, vecNorm.y * _len);
        }
        Vector2.Sub = function(_vec0, _vec1) {
            return new Vector2(_vec0.x - _vec1.x, _vec0.y - _vec1.y, _vec0.z - _vec1.z);
        }

        function EulerMass(_x, _y, _mass, _drag) {
            this.position = new Vector2(_x, _y);
            this.mass = _mass;
            this.drag = _drag;
            this.force = new Vector2(0, 0);
            this.velocity = new Vector2(0, 0);
            this.AddForce = function(_f) {
                this.force.Add(_f);
            }
            this.Integrate = function(_dt) {
                var acc = this.CurrentForce(this.position);
                acc.Div(this.mass);
                var posDelta = new Vector2(this.velocity.x, this.velocity.y);
                posDelta.Mul(_dt);
                this.position.Add(posDelta);
                acc.Mul(_dt);
                this.velocity.Add(acc);
                this.force = new Vector2(0, 0);
            }
            this.CurrentForce = function(_pos, _vel) {
                var totalForce = new Vector2(this.force.x, this.force.y);
                var speed = this.velocity.Length();
                var dragVel = new Vector2(this.velocity.x, this.velocity.y);
                dragVel.Mul(this.drag * this.mass * speed);
                totalForce.Sub(dragVel);
                return totalForce;
            }
        }

        function ConfettiPaper(_x, _y) {
            this.pos = new Vector2(_x, _y);
            this.rotationSpeed = Math.random() * 600 + 800;
            this.angle = DEG_TO_RAD * Math.random() * 360;
            this.rotation = DEG_TO_RAD * Math.random() * 360;
            this.cosA = 1.0;
            this.size = 5.0;
            this.oscillationSpeed = Math.random() * 1.5 + 0.5;
            this.xSpeed = 40.0;
            this.ySpeed = Math.random() * 60 + 50.0;
            this.corners = new Array();
            this.time = Math.random();
            var ci = Math.round(Math.random() * (colors.length - 1));
            this.frontColor = colors[ci][0];
            this.backColor = colors[ci][1];
            for (var i = 0; i < 4; i++) {
                var dx = Math.cos(this.angle + DEG_TO_RAD * (i * 90 + 45));
                var dy = Math.sin(this.angle + DEG_TO_RAD * (i * 90 + 45));
                this.corners[i] = new Vector2(dx, dy);
            }
            this.Update = function(_dt) {
                this.time += _dt;
                this.rotation += this.rotationSpeed * _dt;
                this.cosA = Math.cos(DEG_TO_RAD * this.rotation);
                this.pos.x += Math.cos(this.time * this.oscillationSpeed) * this.xSpeed * _dt
                this.pos.y += this.ySpeed * _dt;
                if (this.pos.y > ConfettiPaper.bounds.y) {
                    this.pos.x = Math.random() * ConfettiPaper.bounds.x;
                    this.pos.y = 0;
                }
            }
            this.Draw = function(_g) {
                if (this.cosA > 0) {
                    _g.fillStyle = this.frontColor;
                } else {
                    _g.fillStyle = this.backColor;
                }
                _g.beginPath();
                _g.moveTo(this.pos.x + this.corners[0].x * this.size, this.pos.y + this.corners[0].y * this.size * this.cosA);
                for (var i = 1; i < 4; i++) {
                    _g.lineTo(this.pos.x + this.corners[i].x * this.size, this.pos.y + this.corners[i].y * this.size * this.cosA);
                }
                _g.closePath();
                _g.fill();
            }
        }
        ConfettiPaper.bounds = new Vector2(0, 0);

        function ConfettiRibbon(_x, _y, _count, _dist, _thickness, _angle, _mass, _drag) {
            this.particleDist = _dist;
            this.particleCount = _count;
            this.particleMass = _mass;
            this.particleDrag = _drag;
            this.particles = new Array();
            var ci = Math.round(Math.random() * (colors.length - 1));
            this.frontColor = colors[ci][0];
            this.backColor = colors[ci][1];
            this.xOff = Math.cos(DEG_TO_RAD * _angle) * _thickness;
            this.yOff = Math.sin(DEG_TO_RAD * _angle) * _thickness;
            this.position = new Vector2(_x, _y);
            this.prevPosition = new Vector2(_x, _y);
            this.velocityInherit = Math.random() * 2 + 4;
            this.time = Math.random() * 100;
            this.oscillationSpeed = Math.random() * 2 + 2;
            this.oscillationDistance = Math.random() * 40 + 40;
            this.ySpeed = Math.random() * 40 + 80;
            for (var i = 0; i < this.particleCount; i++) {
                this.particles[i] = new EulerMass(_x, _y - i * this.particleDist, this.particleMass, this.particleDrag);
            }
            this.Update = function(_dt) {
                var i = 0;
                this.time += _dt * this.oscillationSpeed;
                this.position.y += this.ySpeed * _dt;
                this.position.x += Math.cos(this.time) * this.oscillationDistance * _dt;
                this.particles[0].position = this.position;
                var dX = this.prevPosition.x - this.position.x;
                var dY = this.prevPosition.y - this.position.y;
                var delta = Math.sqrt(dX * dX + dY * dY);
                this.prevPosition = new Vector2(this.position.x, this.position.y);
                for (i = 1; i < this.particleCount; i++) {
                    var dirP = Vector2.Sub(this.particles[i - 1].position, this.particles[i].position);
                    dirP.Normalize();
                    dirP.Mul((delta / _dt) * this.velocityInherit);
                    this.particles[i].AddForce(dirP);
                }
                for (i = 1; i < this.particleCount; i++) {
                    this.particles[i].Integrate(_dt);
                }
                for (i = 1; i < this.particleCount; i++) {
                    var rp2 = new Vector2(this.particles[i].position.x, this.particles[i].position.y);
                    rp2.Sub(this.particles[i - 1].position);
                    rp2.Normalize();
                    rp2.Mul(this.particleDist);
                    rp2.Add(this.particles[i - 1].position);
                    this.particles[i].position = rp2;
                }
                if (this.position.y > ConfettiRibbon.bounds.y + this.particleDist * this.particleCount) {
                    this.Reset();
                }
            }
            this.Reset = function() {
                this.position.y = -Math.random() * ConfettiRibbon.bounds.y;
                this.position.x = Math.random() * ConfettiRibbon.bounds.x;
                this.prevPosition = new Vector2(this.position.x, this.position.y);
                this.velocityInherit = Math.random() * 2 + 4;
                this.time = Math.random() * 100;
                this.oscillationSpeed = Math.random() * 2.0 + 1.5;
                this.oscillationDistance = Math.random() * 40 + 40;
                this.ySpeed = Math.random() * 40 + 80;
                var ci = Math.round(Math.random() * (colors.length - 1));
                this.frontColor = colors[ci][0];
                this.backColor = colors[ci][1];
                this.particles = new Array();
                for (var i = 0; i < this.particleCount; i++) {
                    this.particles[i] = new EulerMass(this.position.x, this.position.y - i * this.particleDist, this.particleMass, this.particleDrag);
                }
            }
            this.Draw = function(_g) {
                for (var i = 0; i < this.particleCount - 1; i++) {
                    var p0 = new Vector2(this.particles[i].position.x + this.xOff, this.particles[i].position.y + this.yOff);
                    var p1 = new Vector2(this.particles[i + 1].position.x + this.xOff, this.particles[i + 1].position.y + this.yOff);
                    if (this.Side(this.particles[i].position.x, this.particles[i].position.y, this.particles[i + 1].position.x, this.particles[i + 1].position.y, p1.x, p1.y) < 0) {
                        _g.fillStyle = this.frontColor;
                        _g.strokeStyle = this.frontColor;
                    } else {
                        _g.fillStyle = this.backColor;
                        _g.strokeStyle = this.backColor;
                    }
                    if (i == 0) {
                        _g.beginPath();
                        _g.moveTo(this.particles[i].position.x, this.particles[i].position.y);
                        _g.lineTo(this.particles[i + 1].position.x, this.particles[i + 1].position.y);
                        _g.lineTo((this.particles[i + 1].position.x + p1.x) * 0.5, (this.particles[i + 1].position.y + p1.y) * 0.5);
                        _g.closePath();
                        _g.stroke();
                        _g.fill();
                        _g.beginPath();
                        _g.moveTo(p1.x, p1.y);
                        _g.lineTo(p0.x, p0.y);
                        _g.lineTo((this.particles[i + 1].position.x + p1.x) * 0.5, (this.particles[i + 1].position.y + p1.y) * 0.5);
                        _g.closePath();
                        _g.stroke();
                        _g.fill();
                    } else if (i == this.particleCount - 2) {
                        _g.beginPath();
                        _g.moveTo(this.particles[i].position.x, this.particles[i].position.y);
                        _g.lineTo(this.particles[i + 1].position.x, this.particles[i + 1].position.y);
                        _g.lineTo((this.particles[i].position.x + p0.x) * 0.5, (this.particles[i].position.y + p0.y) * 0.5);
                        _g.closePath();
                        _g.stroke();
                        _g.fill();
                        _g.beginPath();
                        _g.moveTo(p1.x, p1.y);
                        _g.lineTo(p0.x, p0.y);
                        _g.lineTo((this.particles[i].position.x + p0.x) * 0.5, (this.particles[i].position.y + p0.y) * 0.5);
                        _g.closePath();
                        _g.stroke();
                        _g.fill();
                    } else {
                        _g.beginPath();
                        _g.moveTo(this.particles[i].position.x, this.particles[i].position.y);
                        _g.lineTo(this.particles[i + 1].position.x, this.particles[i + 1].position.y);
                        _g.lineTo(p1.x, p1.y);
                        _g.lineTo(p0.x, p0.y);
                        _g.closePath();
                        _g.stroke();
                        _g.fill();
                    }
                }
            }
            this.Side = function(x1, y1, x2, y2, x3, y3) {
                return ((x1 - x2) * (y3 - y2) - (y1 - y2) * (x3 - x2));
            }
        }
        ConfettiRibbon.bounds = new Vector2(0, 0);
        confetti = {};
        confetti.Context = function(parent) {
            var i = 0;
            var canvasParent = document.getElementById(parent);
            var canvas = document.createElement('canvas');
            canvas.width = canvasParent.offsetWidth;
            canvas.height = canvasParent.offsetHeight;
            canvasParent.appendChild(canvas);
            var context = canvas.getContext('2d');
            var interval = null;
            var confettiRibbonCount = 7;
            var rpCount = 30;
            var rpDist = 8.0;
            var rpThick = 8.0;
            var confettiRibbons = new Array();
            ConfettiRibbon.bounds = new Vector2(canvas.width, canvas.height);
            for (i = 0; i < confettiRibbonCount; i++) {
                confettiRibbons[i] = new ConfettiRibbon(Math.random() * canvas.width, -Math.random() * canvas.height * 2, rpCount, rpDist, rpThick, 45, 1, 0.05);
            }
            var confettiPaperCount = 25;
            var confettiPapers = new Array();
            ConfettiPaper.bounds = new Vector2(canvas.width, canvas.height);
            for (i = 0; i < confettiPaperCount; i++) {
                confettiPapers[i] = new ConfettiPaper(Math.random() * canvas.width, Math.random() * canvas.height);
            }
            this.resize = function() {
                canvas.width = canvasParent.offsetWidth;
                canvas.height = canvasParent.offsetHeight;
                ConfettiPaper.bounds = new Vector2(canvas.width, canvas.height);
                ConfettiRibbon.bounds = new Vector2(canvas.width, canvas.height);
            }
            this.start = function() {
                this.stop()
                var context = this
                this.interval = setInterval(function() {
                    confetti.update();
                }, 1000.0 / frameRate)
            }
            this.stop = function() {
                clearInterval(this.interval);
            }
            this.update = function() {
                var i = 0;
                context.clearRect(0, 0, canvas.width, canvas.height);
                for (i = 0; i < confettiPaperCount; i++) {
                    confettiPapers[i].Update(dt);
                    confettiPapers[i].Draw(context);
                }
                for (i = 0; i < confettiRibbonCount; i++) {
                    confettiRibbons[i].Update(dt);
                    confettiRibbons[i].Draw(context);
                }
            }
        }
        var confetti = new confetti.Context('confetti');
        confetti.start();
        $(window).resize(function() {
            confetti.resize();
        });
    });


    function playSound(e) {
        const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
        const key = document.querySelector(`.key[data-key="${e.keyCode}"]`);
        if (!audio) return; // stop the function from running all together
        audio.currentTime = 0; // rewind to the start
        audio.play();
        key.classList.add('playing');
      }
      function removeTransition(e) {
        if (e.propertyName !== 'transform') return; // skip it if it's not a transform
        this.classList.remove('playing');
      }

      const keys = document.querySelectorAll('.key');
      keys.forEach(key => key.addEventListener('transitionend', removeTransition));
      window.addEventListener('keydown', playSound);
