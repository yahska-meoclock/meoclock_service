
import WebSocket from "ws";
import shortid from "shortid";

const wss = new WebSocket.Server({port: 3012})


export default wss