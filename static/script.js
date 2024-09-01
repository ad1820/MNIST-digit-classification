const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const predictBtn = document.getElementById('predictBtn');
const clearBtn = document.getElementById('clearBtn');
const resultP = document.getElementById('result');

let isDrawing = false;

canvas.width = 280;
canvas.height = 280;

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = 'black';
ctx.lineWidth = 20;
ctx.lineCap = 'round';

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);
canvas.addEventListener('touchend', stopDrawing);

clearBtn.addEventListener('click', clearCanvas);
predictBtn.addEventListener('click', predict);

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function handleTouch(e) {
    e.preventDefault();
    if (e.type === 'touchstart') {
        isDrawing = true;
    }
    if (isDrawing) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function clearCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    resultP.textContent = '';
}

function predict() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const grayScaleData = [];
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        grayScaleData.push(1 - avg / 255); 
    }

    const resizedData = resizeArray(grayScaleData, 280, 280, 28, 28);

    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({image: resizedData}),
    })
    .then(response => response.json())
    .then(data => {
        resultP.textContent = `Predicted digit: ${data.prediction}`;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function resizeArray(array, oldWidth, oldHeight, newWidth, newHeight) {
    const resized = new Array(newWidth * newHeight);
    const xRatio = oldWidth / newWidth;
    const yRatio = oldHeight / newHeight;

    for (let i = 0; i < newHeight; i++) {
        for (let j = 0; j < newWidth; j++) {
            const px = Math.floor(j * xRatio);
            const py = Math.floor(i * yRatio);
            resized[(i * newWidth) + j] = array[(py * oldWidth) + px];
        }
    }

    return resized;
}