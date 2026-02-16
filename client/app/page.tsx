"use client"
import random from "random-string-generator"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"


export default function Home() {

    const [myKey,setMykey] = useState("")
    const [roomName,setRoomName] = useState("")
    const socket = useRef<WebSocket|null>(null)

    const router = useRouter()

    

    useEffect(()=>{

    socket.current = new WebSocket("ws://localhost:9000")

    if(socket.current){
        socket.current.onopen = ()=>{
          alert("Room is opened")
        }
    }

    if(socket.current){
        socket.current.onmessage = (event)=>{
          console.log("Inside")
          let message = JSON.parse(event.data)
          let userMessage = message.msg
          if(userMessage === "SENDER"){
            let roomId = message.roomId
            setTimeout(()=>router.push(`/Sender/${roomId}`),2000)
          }
          else if(userMessage === "REMOTE"){
            let roomId = message.roomId
            setTimeout(()=>router.push(`/Receiver/${roomId}`),2000)
          }
        }
    }

    },[])

   


    const generateString = ()=>{
        let string = random(12,'lower')
        setMykey(string)
    }

    const JoinRoom = ()=>{
        socket.current?.send(JSON.stringify({msg:"REMOTE",roomId:roomName}))
    }

    const CreateRoom = ()=>{
        socket.current?.send(JSON.stringify({msg:"SENDER",roomId:roomName}))
    }



 return(
  <>
  <div className="flex w-full h-screen items-center justify-center flex-col space-y-6">
    <input onChange={(e)=>setRoomName(e.target.value)} className="border-2 border-white rounded-lg p-2"></input>
    <button onClick={generateString} className="text-white border-2 border-white p-3 font-[20px]">Create key</button>
    <button onClick={CreateRoom} className="text-white border-2 border-white p-3 font-[20px]">Create Room</button>
    <button onClick={JoinRoom} className="text-white border-2 border-white p-3 font-[20px]">Join Room</button>
    <h1>Key is : {myKey}</h1>
    </div>
  </>
 )
}
