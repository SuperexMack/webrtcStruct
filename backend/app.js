import { WebSocketServer } from "ws";
const PORT = 9000
import http from "http"

const wss = new WebSocketServer({port:PORT})

let senderSide = null,recSide = null

wss.on("connection",(ws)=>{
    ws.on("message",(data)=>{
       let message = JSON.parse(data);
       if(message.msg === "SENDER"){
        senderSide = ws
       }
       else if(message.msg === "REMOTE"){
        recSide = ws
       }
       else if(message.msg === "ice-candidate"){
          if(ws === senderSide){
            senderSide.send(JSON.stringify({msg:"ice-candidate",candidate:message.candidate}))
          }
          else{
            recSide.send(JSON.stringify({msg:"ice-candidate",candidate:message.candidate}))
          }
       }
       else if(message.msg === "create-offer"){
         if(ws !== senderSide) return
         recSide.send(JSON.stringify({type : "create-offer" , sdp : message.sdp}))
       }

       else if(message.msg === "create-answer"){
         if(ws !== recSide) return
         senderSide.send(JSON.stringify({type : "create-answer" , sdp : message.sdp}))
       }

    })
})