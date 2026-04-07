//Game
// export let canvasWidth ;
// export let canvasHeight = 800;

//Ball
export const ballSprite = "./Assets/Sprites/Ball.png";
// export let ballX = canvas.width / 2 ;
// export let ballY = canvas.height / 2;
export let ballWidth = 5;
export let ballHeight = 5;
export let ballDx = 2;
export let ballDy = 2;

export const maxBallSpeedY = 15;
export const maxBallSpeedX = 10;
export const minBallSpeedY = 1;
export const minBallSpeedX = 1;

//Physics
export const frictionY = 0.7;
export const frictionX = 0.2;

//Paddle
export let paddleWidth = 20;
export let paddleHeight = 5;

//Target
export let targetMinWidth = 5;
export let targetMaxWidth = 20;
export let targetWidth = 16;
export let targetHeight = 5;

//Line
export let lineHeight = 1;

//DeadZone
export let deadZoneHeight = 5;

//Boosters
export const boosterSize = 10;
export const boosterSpawnStep = 1;
export const boosterSpawnChance = 100;
export const percentOfHiddenSpriteOfBooster = 36;
export const hiddenBoosterSprite = "./Assets/Sprites/HiddenBooster.png";
export const ballSizeUpBoosterSprite = "./Assets/Sprites/BallSizeUpBooster.png";
export const ballSizeUpBoosterValue = 10;
export const ballSizeDownBoosterSprite = "./Assets/Sprites/BallSizeDownBooster.png";