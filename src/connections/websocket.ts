
import WebSocket from "ws";
import shortid from "shortid";

const wss = new WebSocket.Server({port: 3012})


wss.on('connection', (ws:WebSocket) => {
    ws.on('message', (message:any) => {
    console.log(`Received message => ${message}`)
    })
    ws.send('ho!')
})

export default wss