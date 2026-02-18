import { WebSocketServer } from "ws";
import express from "express"
import cors from "cors"
const app = express()
const PORT = 9000
const httpserver = app.listen(PORT)


const wss = new WebSocketServer({server:httpserver})

app.use(cors({
   origin:"https://webrtc-struct.vercel.app",
   methods: ["GET", "POST"],
   allowedHeaders : ["Content-Type","Authorization"]
}))

app.get("/",(req,res)=>{
  return res.json({msg:"v1"})
})


let rooms = {}

// let senderSide = null
// let recSide = null

wss.on("connection",(ws)=>{
    ws.on("message",(data)=>{
       console.log("Setted")
       let message = JSON.parse(data);
       if(message.msg === "SENDER"){
         if(!rooms[message.roomId]){
          console.log("SENDER ARRIVED")
          rooms[message.roomId] = []
         }
          rooms[message.roomId][0] = ws
          // rooms[message.roomId] = {ws:ws,user:"SENDER"}
          ws.send(JSON.stringify({msg:"SENDER",roomId:message.roomId}))
         
         console.log("SENDER Added")
       }
       else if(message.msg === "REMOTE"){
        console.log("REMOTE User arrived")
        if (!rooms[message.roomId]) rooms[message.roomId] = []
        
        rooms[message.roomId][1] = ws
        ws.send(JSON.stringify({msg:"REMOTE",roomId:message.roomId}))
        
       }
       else if(message.msg === "ice-candidate"){
          console.log("ice candidate")
          if(!rooms[message.roomId] || !rooms[message.roomId][0] || !rooms[message.roomId][1]) return;
          if(ws === rooms[message.roomId][0]){
            console.log("ice candidate senderSide")
            rooms[message.roomId][1].send(JSON.stringify({msg:"ice-candidate",candidate:message.candidate}))
          }
          else{
            console.log("ice candidate recSide")
            rooms[message.roomId][0].send(JSON.stringify({msg:"ice-candidate",candidate:message.candidate}))
          }
       }
       else if(message.msg === "create-offer"){
        console.log("create offer")
        if (!rooms[message.roomId] || !rooms[message.roomId][1]) return
        console.log("create offer inside")
        rooms[message.roomId][1].send(JSON.stringify({msg : "create-offer" , sdp : message.sdp,roomMsg:`We are here in the room number ${message.roomId}`}))
       }

       else if(message.msg === "create-answer"){
        console.log("create-answer")
         if (!rooms[message.roomId] || !rooms[message.roomId][0]) return
         console.log("create-answer inside")
         rooms[message.roomId][0].send(JSON.stringify({msg : "create-answer" , sdp : message.sdp,roomMsg:`We are here in the room number ${message.roomId}`}))
       }

    })
})

console.log("Server has beed started")