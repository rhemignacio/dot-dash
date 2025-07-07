const socket = io();
const startBtn = document.getElementById('startBtn');
const gameArea = document.getElementById('gameArea');
const dot = document.getElementById('dot');
const scoreList = document.getElementById('scoreList');

let roomId = 'room1';

startBtn.addEventListener('click', () => {
  socket.emit('joinGame', roomId);
  startBtn.classList.add('hidden');
  gameArea.classList.remove('hidden');
});

dot.addEventListener('click', () => {
  socket.emit('clickDot', roomId);
  dot.classList.add('hidden');
});

socket.on('showDot', () => {
  dot.classList.remove('hidden');
});

socket.on('playerUpdate', (players) => {
  scoreList.innerHTML = '';
  for (const id in players) {
    const li = document.createElement('li');
    li.textContent = \`\${id === socket.id ? 'You' : id.slice(0, 4)}: \${players[id].score}\`;
    scoreList.appendChild(li);
  }
});

socket.on('gameOver', (winnerId) => {
  alert(winnerId === socket.id ? 'You win!' : 'You lose!');
  location.reload();
});