const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

let waitingPlayer = null;

wss.on('connection', (ws) => {
    console.log('Новый игрок подключился к серверу!');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'join_matchmaking') {
                if (waitingPlayer && waitingPlayer.readyState === WebSocket.OPEN && waitingPlayer !== ws) {
                    const p1 = waitingPlayer;
                    const p2 = ws;
                    waitingPlayer = null;

                    const name1 = "Cyber_Player_" + Math.floor(Math.random() * 900 + 100);
                    const name2 = "Cyber_Player_" + Math.floor(Math.random() * 900 + 100);

                    p1.send(JSON.stringify({ type: 'match_found', oppName: name2 }));
                    p2.send(JSON.stringify({ type: 'match_found', oppName: name1 }));
                    
                    console.log('Матч между реальными людьми создан!');
                } else {
                    waitingPlayer = ws;
                    ws.send(JSON.stringify({ type: 'searching' }));
                }
            }
        } catch (e) {
            console.log('Ошибка обработки сообщения');
        }
    });

    ws.on('close', () => {
        if (waitingPlayer === ws) waitingPlayer = null;
    });
});

console.log('Сервер запущен на порту ' + PORT);
