import * as variable from "./variables.js" ;
import {ballSizeUpBoosterValue} from "./variables.js";

export const canvas = document.getElementById('pong');
const context = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

canvas.style.backgroundColor = "#f67007";
document.body.style.backgroundColor = "#191a1c";

let scoreText = "0";

const ballSprite = new Image();
ballSprite.src = variable.ballSprite;

const hiddenBoosterSprite = new Image();
hiddenBoosterSprite.src = variable.hiddenBoosterSprite;
const ballSizeUpBoosterSprite = new Image();
ballSizeUpBoosterSprite.src = variable.ballSizeUpBoosterSprite;
const ballSizeDownBoosterSprite = new Image();
ballSizeDownBoosterSprite.src = variable.ballSizeDownBoosterSprite;

function setSizeOfPercentOfScreen(canvasSize, elementSize){
    return canvasSize / 100 * elementSize;
}

const ball = {
    x: (canvas.width / 2) -  setSizeOfPercentOfScreen(canvas.width, variable.ballWidth) / 2,
    y: (canvas.height / 2) - setSizeOfPercentOfScreen(canvas.width, variable.ballHeight) / 2,
    dx: variable.ballDx,
    dy: variable.ballDy,
    width: setSizeOfPercentOfScreen(canvas.width, variable.ballWidth),
    height: setSizeOfPercentOfScreen(canvas.width, variable.ballHeight),
};

const maxBallSpeedY = variable.maxBallSpeedY;
const maxBallSpeedX = variable.maxBallSpeedX;
const minBallSpeedY = variable.minBallSpeedY;
const minBallSpeedX = variable.minBallSpeedX;

const frictionY = variable.frictionY;
const frictionX = variable.frictionX;

const paddle = {
    x: (canvas.width - setSizeOfPercentOfScreen(canvas.width, variable.paddleWidth)) / 2,
    y: canvas.height / 2 + canvas.height / 4 - setSizeOfPercentOfScreen(canvas.width, variable.paddleHeight) / 2,
    width: setSizeOfPercentOfScreen(canvas.width, variable.paddleWidth),
    height: setSizeOfPercentOfScreen(canvas.width, variable.paddleHeight),
    prevY: 0,
    prevX: 0,
    speedY: 0,
    speedX: 0
};

const line = {
    x: 0,
    y: canvas.height / 2 - variable.lineHeight / 2,
    width: canvas.width,
    height: setSizeOfPercentOfScreen(canvas.width, variable.lineHeight)
}

const target = {
    x: (canvas.width - 80) / 2,
    y: 0,
    width: setSizeOfPercentOfScreen(canvas.width, variable.targetWidth),
    height: setSizeOfPercentOfScreen(canvas.width, variable.targetHeight)
};

const deathZone = {
    x: 0,
    y: canvas.height - setSizeOfPercentOfScreen(canvas.width, variable.deadZoneHeight),
    width: canvas.width,
    height: setSizeOfPercentOfScreen(canvas.width, variable.deadZoneHeight)
};

class BoosterType {
    constructor(sprite, cooldown) {
        let chance = randomRange(1, 101);
        if (chance <= variable.percentOfHiddenSpriteOfBooster){
            this.sprite = hiddenBoosterSprite;
        }
        else{
            this.sprite = sprite;
        }

        this.cooldown = cooldown;
        this.countdownInterval = null;
    }

    useBoosterPower() {}

    removeBoosterPower() {}

    useBooster() {
        this.useBoosterPower();
        activeBoostersArray.push(this);

        this.countdownInterval = setInterval(() => {
            if (--this.cooldown < 0) {
                this.removeBoosterPower();
                clearInterval(this.countdownInterval);
                getArrayValue(activeBoostersArray, (item, index) => {
                    if (item === this) {
                        activeBoostersArray.splice(index, 1);
                    }
                })
            }
        }, 1000);
    }
}

class BallSizePlusBoosterType extends BoosterType {
    constructor() {
        super(ballSizeUpBoosterSprite, 5);
    }

    useBoosterPower() {
        console.log('BALL SIZE UP BOOSTER USED');
        ball.width += variable.ballSizeUpBoosterValue;
        ball.height += variable.ballSizeUpBoosterValue;
    }

    removeBoosterPower() {
        console.log('BALL SIZE UP BOOSTER REMOVED');
        ball.width -= variable.ballSizeUpBoosterValue;
        ball.height -= variable.ballSizeUpBoosterValue;
    }
}

class PaddleWidthPlusBoosterType extends BoosterType {
    constructor() {
        super(ballSizeDownBoosterSprite, 10);
    }

    useBoosterPower() {
        console.log('PADDLE WIDTH UP BOOSTER USED');
        paddle.width += 20;
    }

    removeBoosterPower() {
        console.log('PADDLE WIDTH UP BOOSTER REMOVED');
        paddle.width -= 20;
    }
}

class Booster {
    constructor(x, y, width, height, type) {
        this.booster = {
            x: x,
            y: y,
            width: width,
            height: height,
            boosterType: type
        }
    }

    drawBooster() {
        drawSprite(this.booster.boosterType.sprite, this.booster);
    }

    collectBooster() {
        this.booster.boosterType.useBooster();

        getArrayValue(boostersOnFieldArray, (item, index) => {
            if (item === this) {
                boostersOnFieldArray.splice(index, 1);
            }
        })
    }
}

let boostersOnFieldArray = [];
let activeBoostersArray = [];
let boosterTypesArray = [PaddleWidthPlusBoosterType, BallSizePlusBoosterType];

let scoreGlobal = 0
let score = {
    get scoreValue() {
        return scoreGlobal;
    },
    set scoreValue(value) {
        scoreGlobal = value;
        scoreText = scoreGlobal;

        if(scoreGlobal % variable.boosterSpawnStep === 0){
            let chanceToSpawn = randomRange(0, 100);
            if(chanceToSpawn <= variable.boosterSpawnChance){
                boosterSpawn();
            }
        }
    },
};

function spawnRandomBooster() {
    const RandomClass = boosterTypesArray[randomRange(0, boosterTypesArray.length)];

    return new RandomClass();
}

function boosterSpawn(){
    const newBoosterType = spawnRandomBooster();

    let randomBooster = new Booster(randomRange(0, canvas.width - 25),
        randomRange(0, canvas.height / 2 - 25 - 25),
        setSizeOfPercentOfScreen(canvas.width, variable.boosterSize),
        setSizeOfPercentOfScreen(canvas.width, variable.boosterSize),
        newBoosterType);
    boostersOnFieldArray.push(randomBooster);
}

let isGameStarted = false;

let canMovePaddle = false;

canvas.addEventListener('mousemove', (event) => {
    if (event.clientY >= canvas.height / 2 && canMovePaddle) {
        paddle.x = event.clientX - paddle.width / 2;
        paddle.y = event.clientY - paddle.height / 2
    }
});
canvas.addEventListener('mousedown', (event) => {
    if (!isGameStarted) {
        isGameStarted = true;
        ball.dx = randomVariant(variable.ballDx, -variable.ballDx);
    }
    if (event.clientY >= paddle.y &&
        event.clientY <= paddle.y + paddle.height &&
        event.clientX >= paddle.x &&
        event.clientX <= paddle.x + paddle.width) {
        canMovePaddle = true;
    }
});

canvas.addEventListener('mouseup', (event) => {
    canMovePaddle = false;
})

function getArrayValue(array, callback) {
    for (let i = array.length - 1; i >= 0; i--) {
        callback(array[i], i, array);
    }
}

function gameLoop() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawText();
    drawLine();

    drawPaddle();
    drawBall();
    drawTarget();
    drawDeathZone();

    getArrayValue(boostersOnFieldArray, (item) => {
        item.drawBooster();
    })

    paddle.speedY = paddle.y - paddle.prevY;
    paddle.prevY = paddle.y;

    paddle.speedX = paddle.x - paddle.prevX;
    paddle.prevX = paddle.x;

    if (isGameStarted) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.y + ball.width > canvas.height || ball.y < 0) {
            ball.dy = -ball.dy;
        }
        if (ball.x < 0 || ball.x + ball.width > canvas.width) {
            ball.dx = -ball.dx;
        }

        if (collision(ball, paddle) && ball.dy > 0) {
            handlePaddleCollision(ball, paddle);
        }
        if (collision(ball, target)) {
            reachTarget();
        }
        if (collision(ball, deathZone)) {
            resetGame();
        }

        getArrayValue(boostersOnFieldArray, (item) => {
            if (collision(ball, item.booster)) {
                item.collectBooster();
            }
        })
    }

    requestAnimationFrame(gameLoop);
}

function collision(object1, object2) {
    return object1.y + object1.height > object2.y &&
        object1.y < object2.y + object2.height &&
        object1.x + object1.width > object2.x &&
        object1.x < object2.x + object2.width;
}

function handlePaddleCollision(ball, paddle) {
    //Просто отскок мяча лучше чем -(ballSpeed)

    // 1. Находим точку касания относительно ЦЕНТРА ракетки по горизонтали (X)
    // Если мяч левее центра — число отрицательное, если правее — положительное
    // let collidePoint = ball.x - (paddle.x + paddle.width / 2);
    //
    // // 2. Нормализуем (от -1 до 1)
    // // Делим на половину ширины ракетки
    // collidePoint = collidePoint / (paddle.width / 2);
    //
    // // 3. Рассчитываем угол в радианах (макс. 60 градусов для красоты)
    // // Мы вычитаем Math.PI / 2 (90 градусов), чтобы "0" смотрел строго вверх
    // let angleRad = collidePoint * (Math.PI / 3);
    //
    // // 4. Вычисляем общую скорость (чтобы мяч не замедлялся при смене угла)
    // let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    //
    // // 5. Обновляем скорости
    // // По X используем sin, по Y — cos (и инвертируем Y, чтобы летел вверх)
    // ball.dx = speed * Math.sin(angleRad);
    // ball.dy = -speed * Math.cos(angleRad);
    //
    // ball.dx *= 1.0025;
    // ball.dy *= 1.0025;
    // ======================================================================

    // Тест проводки 1

    // ball.dy = -Math.abs(ball.dy);
    //
    // let impact = paddle.speedY * 0.1;
    // if (impact === 0) {
    //     ball.dy = ball.dy / 2;
    // }
    // else{
    //     ball.dy += impact;
    // }
    //
    // let paddleSpeedX = paddle.x - paddle.prevX; // Нужно также трекать prevX
    // ball.dx += paddleSpeedX * 0.3;

    //============================================================================

    // Тест проводки 2

    // let bounceContext = -ball.dy * 0.7;
    //
    // // 3. Финальная скорость = Ослабленный отскок + Импульс от удара
    // // Мы делим импульс на 2 (или другой коэффициент), чтобы не было слишком резко
    // ball.dy = bounceContext + (paddle.speedY * 0.5);
    //
    // // 4. Ограничитель (Минимальная скорость)
    // // Чтобы мяч совсем не остановился, задаем порог
    // const minSpeed = 2;
    // if (Math.abs(ball.dy) < minSpeed) {
    //     ball.dy = ball.dy > 0 ? minSpeed : -minSpeed;
    // }
    //
    // // 5. Ограничитель (Максимальная скорость)
    // // Чтобы мяч не улетал "пулей" после резкого рывка
    // const maxSpeed = 6;
    // if (Math.abs(ball.dy) > maxSpeed) {
    //     ball.dy = ball.dy > 0 ? maxSpeed : -maxSpeed;
    // }

    //===========================================================================

    let bounceSpeed = -ball.dy * frictionY;

    let boost = paddle.speedY * 0.5;

    ball.dy = bounceSpeed + boost;

    ball.dx = (ball.dx * frictionX) + (paddle.speedX * 0.8);

    if (Math.abs(ball.dx) > maxBallSpeedX) {
        ball.dx = ball.dx > 0 ? maxBallSpeedX : -maxBallSpeedX;
    }
    if (Math.abs(ball.dx) < minBallSpeedX) {
        ball.dx = ball.dx > 0 ? minBallSpeedX : -minBallSpeedX;
    }

    if (Math.abs(ball.dy) > maxBallSpeedY) {
        ball.dy = ball.dy > 0 ? maxBallSpeedY : -maxBallSpeedY;
    }
    if (Math.abs(ball.dy) < minBallSpeedY) {
        ball.dy = ball.dy > 0 ? minBallSpeedY : -minBallSpeedY;
    }

}

function reachTarget() {
    score.scoreValue++;
    target.width = randomRange(setSizeOfPercentOfScreen(canvas.width,variable.targetMinWidth) , setSizeOfPercentOfScreen(canvas.width, variable.targetMaxWidth));
    target.x = randomRange(0, canvas.width - target.width);
}

function resetGame() {
    isGameStarted = false;
    score.scoreValue = 0;
    ball.x = canvas.width / 2 - setSizeOfPercentOfScreen(canvas.width, variable.ballWidth) / 2;
    ball.y = canvas.height / 2 - setSizeOfPercentOfScreen(canvas.width, variable.ballWidth) / 2;
    ball.dx = variable.ballDx;
    ball.dy = variable.ballDy;

    getArrayValue(activeBoostersArray, (item, index) => {
        clearInterval(item.countdownInterval);
        item.removeBoosterPower();
        activeBoostersArray.splice(index, 1);
    })

    getArrayValue(boostersOnFieldArray, (item, index) => {
        boostersOnFieldArray.splice(index, 1);
    })
}

function drawPaddle() {
    drawRect(paddle, "black");
}

function drawBall() {
    drawSprite(ballSprite, ball);
}

function drawTarget() {
    drawRect(target, "green");
}

function drawDeathZone() {
    drawRect(deathZone, "red");
}

function drawLine() {
    drawRect(line, "purple");
}

function drawText() {
    context.beginPath();
    context.fillStyle = "purple";
    context.font = "bold 52px Verdana";
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(scoreText, (canvas.width / 2), (canvas.height / 4));
    context.closePath();
}

function drawRect(sprite, color) {
    context.beginPath();
    context.fillStyle = color;
    context.rect(sprite.x, sprite.y, sprite.width, sprite.height);
    context.fill();
    context.closePath();
}

function drawSprite(image, sprite){
    if(image.complete && image.naturalWidth !== 0){
        context.drawImage(image, sprite.x, sprite.y, sprite.width, sprite.height);
    }
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randomVariant(a, b){
    return randomRange(0, 2) === 1 ? a : b;
}

gameLoop();
