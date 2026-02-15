import { WebSocketServer } from "ws";
const PORT = 9000


const wss = new WebSocketServer({port:PORT})

let senderSide = null
let recSide = null

wss.on("connection",(ws)=>{
    ws.on("message",(data)=>{
       console.log("Setted")
       let message = JSON.parse(data);
       if(message.msg === "SENDER"){
        console.log("SENDER")
        senderSide = ws
       }
       else if(message.msg === "REMOTE"){
        console.log("REMOTE")
        recSide = ws
       }
       else if(message.msg === "ice-candidate"){
          console.log("ice candidate")
          if(ws === senderSide){
            console.log("ice candidate senderSide")
            recSide.send(JSON.stringify({msg:"ice-candidate",candidate:message.candidate}))
          }
          else{
            console.log("ice candidate recSide")
            senderSide.send(JSON.stringify({msg:"ice-candidate",candidate:message.candidate}))
          }
       }
       else if(message.msg === "create-offer"){
        console.log("create offer")
         if(ws !== senderSide) return
        console.log("create offer inside")
         recSide.send(JSON.stringify({msg : "create-offer" , sdp : message.sdp}))
       }

       else if(message.msg === "create-answer"){
        console.log("create-answer")
         if(ws !== recSide) return
         console.log("create-answer inside")
         senderSide.send(JSON.stringify({msg : "create-answer" , sdp : message.sdp}))
       }

    })
})

console.log("Server has beed started")