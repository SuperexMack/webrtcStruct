"use client"
import { useEffect, useRef } from "react"


export default function(){


    const socket = useRef<WebSocket|null>(null)

    useEffect(()=>{
      
      socket.current = new WebSocket("ws://localhost:9000")
      socket.current.onopen = (()=>{
        socket.current?.send(JSON.stringify({
            msg:"SENDER"
        }))
      })
    },[])

    const sendMessageOtheSide = async()=>{
        let pc = new RTCPeerConnection()

        pc.onnegotiationneeded = async()=>{
          let createOffer = await pc.createOffer()
          await pc.setLocalDescription(createOffer)
          socket.current?.send(JSON.stringify({msg:"create-offer",sdp:pc.localDescription}))
        }

       pc.onicecandidate = (event)=>{
         if(event?.candidate){
            socket.current?.send(JSON.stringify({msg:"ice-candidate",candidate:event.candidate}))
         }
       }

       if(socket.current){
            socket.current.onmessage = async(event)=>{
                let myallmesssage = JSON.parse(event.data)
                if(myallmesssage.msg === "create-answer"){
                    await pc.setRemoteDescription(myallmesssage.sdp)
                }
                else if(myallmesssage.msg === "ice-candidate"){
                    await pc.addIceCandidate(myallmesssage.candidate)
                }
       }

       }

       const stream = await navigator.mediaDevices.getUserMedia({audio:true,video:true})

       stream.getTracks().forEach((track:any)=>pc.addTrack(track,stream))

       alert("Video sended")
       

    }


    return(
        <>
        <div className="w-full justify-center h-auto p-3 flex">
        <h1 className="mt-7 items-center text-[30px] font-bold">Sender's side</h1>
        </div>
        <div className="flex  w-full h-screen items-center justify-center flex-col space-y-8">
        <button className="text-white border-2 p-2 border-white rounded-lg font-bold text-[30px]" onClick={sendMessageOtheSide}>Send Video</button>
        </div>
        </>
    )
}