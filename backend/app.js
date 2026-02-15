import { WebSocketServer } from "ws";
const PORT = 9000
import http from "http"

const wss = new WebSocketServer({port:PORT})

let senderSide = null,recSide = null

wss.on("connection",(ws)=>{
    ws.on("message",(data)=>{
       let message = JSON.stringify(data);
       if(message.data === "SENDER"){
        senderSide = ws
       }
       else if(message.data === "REMOTE"){
        recSide = ws
       }
       
    })
})