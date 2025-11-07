
// snake-game.js - Classic Snake Game Implementation
class SnakeGame {
    constructor(canvasId, scoreId, highScoreId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById(scoreId);
        this.highScoreElement = document.getElementById(highScoreId);
        
        // Game settings - MUCH SLOWER SPEED
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.gameSpeed = 200; // Much slower - increased from 150ms to 200ms
        
        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gameLoop = null;
        
        // Initialize
        this.updateHighScoreDisplay();
        this.draw();
    }
    
    setupEventListeners(startBtnId, pauseBtnId, resetBtnId) {
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Button controls
        if (startBtnId) {
            document.getElementById(startBtnId).addEventListener('click', () => this.startGame());
        }
        if (pauseBtnId) {
            document.getElementById(pauseBtnId).addEventListener('click', () => this.pauseGame());
        }
        if (resetBtnId) {
            document.getElementById(resetBtnId).addEventListener('click', () => this.resetGame());
        }
        
        // Mobile touch controls - only for fullscreen mode
        if (this.canvas.id === 'fullscreenSnakeCanvas') {
            document.querySelectorAll('.control-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const direction = e.target.dataset.direction;
                    this.handleDirection(direction);
                });
            });
        }
        
        console.log('Snake game event listeners setup complete');
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.dx = 1; // Start moving right
        this.dy = 0;
        
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.gameSpeed);
        
        console.log('Snake game started');
    }
    
    pauseGame() {
        this.gameRunning = !this.gameRunning;
        
        if (this.gameRunning) {
            this.gameLoop = setInterval(() => {
                this.update();
                this.draw();
            }, this.gameSpeed);
            console.log('Snake game resumed');
        } else {
            clearInterval(this.gameLoop);
            console.log('Snake game paused');
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        this.snake = [{ x: 10, y: 10 }];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        
        this.updateScoreDisplay();
        this.draw();
        console.log('Snake game reset');
    }
    
    update() {
        // Calculate new head position
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // WRAP AROUND THE SCREEN INSTEAD OF WALL COLLISION
        if (head.x < 0) head.x = this.tileCount - 1;
        if (head.x >= this.tileCount) head.x = 0;
        if (head.y < 0) head.y = this.tileCount - 1;
        if (head.y >= this.tileCount) head.y = 0;
        
        // Game over condition - only self collision
        if (this.isSelfCollision(head)) {
            this.gameOver();
            return;
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            this.updateScoreDisplay();
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (optional)
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head - different color
                this.ctx.fillStyle = '#2ecc71';
            } else {
                this.ctx.fillStyle = '#27ae60';
            }
            this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
        });
        
        // Draw food - make it bigger and more visible
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 1, // Slightly bigger food
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // Add glow effect to food
        this.ctx.shadowColor = '#e74c3c';
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    generateFood() {
        let newFood;
        let attempts = 0;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            attempts++;
            // Prevent infinite loop
            if (attempts > 100) break;
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        return newFood;
    }
    
    handleKeyPress(event) {
        if (!this.gameRunning) return;
        
        // Prevent default behavior for arrow keys
        if ([37, 38, 39, 40].includes(event.keyCode)) {
            event.preventDefault();
        }
        
        // Left arrow
        if (event.keyCode === 37 && this.dx === 0) {
            this.dx = -1;
            this.dy = 0;
        }
        // Up arrow
        else if (event.keyCode === 38 && this.dy === 0) {
            this.dx = 0;
            this.dy = -1;
        }
        // Right arrow
        else if (event.keyCode === 39 && this.dx === 0) {
            this.dx = 1;
            this.dy = 0;
        }
        // Down arrow
        else if (event.keyCode === 40 && this.dy === 0) {
            this.dx = 0;
            this.dy = 1;
        }
    }
    
    handleDirection(direction) {
        if (!this.gameRunning) return;
        
        switch (direction) {
            case 'up':
                if (this.dy === 0) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'down':
                if (this.dy === 0) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'left':
                if (this.dx === 0) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'right':
                if (this.dx === 0) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
        }
    }
    
    isSelfCollision(head) {
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }
    
    updateScoreDisplay() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
    }
    
    updateHighScoreDisplay() {
        if (this.highScoreElement) {
            this.highScoreElement.textContent = this.highScore;
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScoreDisplay();
            
            if (window.showSuccessMessage) {
                showSuccessMessage(`🎉 New High Score: ${this.highScore}!`);
            }
        }
        
        // Show game over message
        if (window.showErrorMessage) {
            showErrorMessage(`Game Over! Final Score: ${this.score}`);
        }
        
        // Draw game over screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
        this.ctx.fillText('Click Reset to play again', this.canvas.width / 2, this.canvas.height / 2 + 70);
        
        console.log('Game Over - Score:', this.score);
    }
}

// Initialize the main snake game
let snakeGame;
let fullscreenSnakeGame;

document.addEventListener('DOMContentLoaded', () => {
    // Main projects page snake game
    snakeGame = new SnakeGame('snakeCanvas', 'snakeScore', 'snakeHighScore');
    snakeGame.setupEventListeners('startSnakeBtn', 'pauseSnakeBtn', 'resetSnakeBtn');
    
    // Fullscreen modal snake game
    fullscreenSnakeGame = new SnakeGame('fullscreenSnakeCanvas', 'fullscreenSnakeScore', 'fullscreenSnakeHighScore');
    fullscreenSnakeGame.setupEventListeners('fullscreenStartBtn', 'fullscreenPauseBtn', 'fullscreenResetBtn');
    
    console.log('Snake games initialized successfully!');
});

// Global functions for HTML onclick attributes
window.startSnakeGame = () => snakeGame.startGame();
window.pauseSnakeGame = () => snakeGame.pauseGame();
window.resetSnakeGame = () => snakeGame.resetGame();
