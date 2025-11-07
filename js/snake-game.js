
// snake-game.js - Classic Snake Game Implementation
class SnakeGame {
    constructor(canvasId, scoreId, highScoreId, isFullscreen = false) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById(scoreId);
        this.highScoreElement = document.getElementById(highScoreId);
        this.isFullscreen = isFullscreen;
        
        // Game settings - SLOWER SPEED and BIGGER CANVAS
        this.gridSize = this.isFullscreen ? 35 : 20;
        this.tileCount = this.canvas.width / this.gridSize;
        this.gameSpeed = 330; // Slow speed
        
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
        
        // Mobile touch controls
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.target.dataset.direction;
                this.handleDirection(direction);
            });
        });
        
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
        
        // WRAP AROUND THE SCREEN
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
        
        // Draw snake with eyes and tail
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head - different color with eyes
                this.drawSnakeHead(segment);
            } else if (index === this.snake.length - 1) {
                // Tail - draw as tail
                this.drawSnakeTail(segment, index);
            } else {
                // Body - regular segment
                this.ctx.fillStyle = '#27ae60';
                this.ctx.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize - 1, this.gridSize - 1);
                
                // Add some body pattern
                this.ctx.fillStyle = '#229954';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 2, 
                    segment.y * this.gridSize + 2, 
                    this.gridSize - 5, 
                    this.gridSize - 5
                );
            }
        });
        
        // Draw food with adjusted size
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 1,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // Add shine to food
        this.ctx.fillStyle = '#ff8c80';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2 - 3,
            this.food.y * this.gridSize + this.gridSize / 2 - 3,
            this.gridSize / 6,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }
    
    drawSnakeHead(head) {
        // Draw head base
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(head.x * this.gridSize, head.y * this.gridSize, this.gridSize - 1, this.gridSize - 1);
        
        // Draw eyes based on direction
        this.ctx.fillStyle = 'white';
        
        if (this.dx === 1) { // Moving right
            // Right eye (facing right)
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + this.gridSize - 8,
                head.y * this.gridSize + 8,
                3, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
            // Left eye (facing right)
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + this.gridSize - 8,
                head.y * this.gridSize + this.gridSize - 8,
                3, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
            // Pupils
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + this.gridSize - 6,
                head.y * this.gridSize + 8,
                1.5, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + this.gridSize - 6,
                head.y * this.gridSize + this.gridSize - 8,
                1.5, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
        } else if (this.dx === -1) { // Moving left
            // Right eye (facing left)
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + 8,
                head.y * this.gridSize + 8,
                3, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
            // Left eye (facing left)
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + 8,
                head.y * this.gridSize + this.gridSize - 8,
                3, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
            // Pupils
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + 10,
                head.y * this.gridSize + 8,
                1.5, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + 10,
                head.y * this.gridSize + this.gridSize - 8,
                1.5, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
        } else if (this.dy === -1) { // Moving up
            // Right eye (facing up)
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + 8,
                head.y * this.gridSize + 8,
                3, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
            // Left eye (facing up)
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + this.gridSize - 8,
                head.y * this.gridSize + 8,
                3, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
            // Pupils
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + 8,
                head.y * this.gridSize + 10,
                1.5, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + this.gridSize - 8,
                head.y * this.gridSize + 10,
                1.5, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
        } else if (this.dy === 1) { // Moving down
            // Right eye (facing down)
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + 8,
                head.y * this.gridSize + this.gridSize - 8,
                3, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
            // Left eye (facing down)
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + this.gridSize - 8,
                head.y * this.gridSize + this.gridSize - 8,
                3, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
            // Pupils
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + 8,
                head.y * this.gridSize + this.gridSize - 10,
                1.5, 0, 2 * Math.PI
            );
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + this.gridSize - 8,
                head.y * this.gridSize + this.gridSize - 10,
                1.5, 0, 2 * Math.PI
            );
            this.ctx.fill();
        }
        
        // Draw mouth (simple line)
        this.ctx.strokeStyle = '#c0392b';
        this.ctx.lineWidth = 1;
        
        if (this.dx === 1) { // Right
            this.ctx.beginPath();
            this.ctx.moveTo(head.x * this.gridSize + this.gridSize - 5, head.y * this.gridSize + this.gridSize / 2);
            this.ctx.lineTo(head.x * this.gridSize + this.gridSize, head.y * this.gridSize + this.gridSize / 2);
            this.ctx.stroke();
        } else if (this.dx === -1) { // Left
            this.ctx.beginPath();
            this.ctx.moveTo(head.x * this.gridSize, head.y * this.gridSize + this.gridSize / 2);
            this.ctx.lineTo(head.x * this.gridSize + 5, head.y * this.gridSize + this.gridSize / 2);
            this.ctx.stroke();
        } else if (this.dy === -1) { // Up
            this.ctx.beginPath();
            this.ctx.moveTo(head.x * this.gridSize + this.gridSize / 2, head.y * this.gridSize);
            this.ctx.lineTo(head.x * this.gridSize + this.gridSize / 2, head.y * this.gridSize + 5);
            this.ctx.stroke();
        } else if (this.dy === 1) { // Down
            this.ctx.beginPath();
            this.ctx.moveTo(head.x * this.gridSize + this.gridSize / 2, head.y * this.gridSize + this.gridSize - 5);
            this.ctx.lineTo(head.x * this.gridSize + this.gridSize / 2, head.y * this.gridSize + this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnakeTail(tail, tailIndex) {
        // Get the direction for the tail (based on the segment before the tail)
        const prevSegment = this.snake[tailIndex - 1];
        const tailDx = tail.x - prevSegment.x;
        const tailDy = tail.y - prevSegment.y;
        
        // Draw tail base
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(tail.x * this.gridSize, tail.y * this.gridSize, this.gridSize - 1, this.gridSize - 1);
        
        // Draw tail tip based on direction
        this.ctx.fillStyle = '#1e8449';
        
        if (tailDx === 1) { // Tail pointing right
            this.ctx.beginPath();
            this.ctx.moveTo(tail.x * this.gridSize, tail.y * this.gridSize);
            this.ctx.lineTo(tail.x * this.gridSize, tail.y * this.gridSize + this.gridSize);
            this.ctx.lineTo(tail.x * this.gridSize + this.gridSize / 2, tail.y * this.gridSize + this.gridSize / 2);
            this.ctx.closePath();
            this.ctx.fill();
        } else if (tailDx === -1) { // Tail pointing left
            this.ctx.beginPath();
            this.ctx.moveTo(tail.x * this.gridSize + this.gridSize, tail.y * this.gridSize);
            this.ctx.lineTo(tail.x * this.gridSize + this.gridSize, tail.y * this.gridSize + this.gridSize);
            this.ctx.lineTo(tail.x * this.gridSize + this.gridSize / 2, tail.y * this.gridSize + this.gridSize / 2);
            this.ctx.closePath();
            this.ctx.fill();
        } else if (tailDy === 1) { // Tail pointing down
            this.ctx.beginPath();
            this.ctx.moveTo(tail.x * this.gridSize, tail.y * this.gridSize);
            this.ctx.lineTo(tail.x * this.gridSize + this.gridSize, tail.y * this.gridSize);
            this.ctx.lineTo(tail.x * this.gridSize + this.gridSize / 2, tail.y * this.gridSize + this.gridSize / 2);
            this.ctx.closePath();
            this.ctx.fill();
        } else if (tailDy === -1) { // Tail pointing up
            this.ctx.beginPath();
            this.ctx.moveTo(tail.x * this.gridSize, tail.y * this.gridSize + this.gridSize);
            this.ctx.lineTo(tail.x * this.gridSize + this.gridSize, tail.y * this.gridSize + this.gridSize);
            this.ctx.lineTo(tail.x * this.gridSize + this.gridSize / 2, tail.y * this.gridSize + this.gridSize / 2);
            this.ctx.closePath();
            this.ctx.fill();
        }
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
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 25);
        this.ctx.fillText('Click Reset to play again', this.canvas.width / 2, this.canvas.height / 2 + 55);
        
        console.log('Game Over - Score:', this.score);
    }
}

// Initialize the main snake game
let snakeGame;
let fullscreenSnakeGame;

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize fullscreen game - no embedded game on projects page
    fullscreenSnakeGame = new SnakeGame('fullscreenSnakeCanvas', 'fullscreenScore', 'fullscreenHighScore', true);
    fullscreenSnakeGame.setupEventListeners('fullscreenStartBtn', 'fullscreenPauseBtn', 'fullscreenResetBtn');
    
    console.log('Fullscreen Snake game initialized successfully!');
});

// Global functions for HTML onclick attributes
window.startSnakeGame = () => fullscreenSnakeGame.startGame();
window.pauseSnakeGame = () => fullscreenSnakeGame.pauseGame();
window.resetSnakeGame = () => fullscreenSnakeGame.resetGame();
