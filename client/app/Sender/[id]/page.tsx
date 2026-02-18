"use client"
import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"



export default function(){


    const socket = useRef<WebSocket|null>(null)
    const RemotevideoRef = useRef<HTMLVideoElement>(null)
    const LocalvideoRef = useRef<HTMLVideoElement>(null)
    const [myRoomid,setMyroomid] = useState("")
    const {id} = useParams<{id:string}>()
    const pc = useRef<RTCPeerConnection | null>(null)

    

    useEffect(()=>{
      
      socket.current = new WebSocket("ws://192.168.43.130:9000")
      
      socket.current.onopen = (()=>{
        socket.current?.send(JSON.stringify({
            msg:"SENDER",
            roomId:id
        }))
      })

      socket.current.onmessage = async(event)=>{
        let myallmesssage = JSON.parse(event.data)
        if(myallmesssage.msg === "create-offer" || myallmesssage.msg === "create-answer")console.log(myallmesssage.roomMsg)
        if(myallmesssage.msg === "create-answer"){
            await pc.current?.setRemoteDescription(myallmesssage.sdp)
        }
        if(myallmesssage.msg === "ice-candidate"){
            await pc.current?.addIceCandidate(myallmesssage.candidate)
        }
      }

    },[])

    const sendMessageOtheSide = async()=>{
        pc.current = new RTCPeerConnection()


         pc.current.ontrack = (event)=>{
          console.log("Video found")
            console.log("We are getting the video")
            RemotevideoRef.current!.srcObject = event.streams[0]
        }

        pc.current.onicecandidate = (event)=>{
         if(event?.candidate){
            socket.current?.send(JSON.stringify({msg:"ice-candidate",candidate:event.candidate,roomId:id}))
         }
       }

      const stream = await navigator.mediaDevices.getUserMedia({audio:true,video:true})

      
      LocalvideoRef.current!.srcObject = stream

      stream.getTracks().forEach((track:any)=>pc.current?.addTrack(track,stream))

      alert("Video sended")
       

        
      let createOffer = await pc.current?.createOffer()
      await pc.current?.setLocalDescription(createOffer)
      socket.current?.send(JSON.stringify({msg:"create-offer",sdp:createOffer,roomId:id}))

    }




    return(
        <>
        <div className="w-full justify-center h-auto p-3 flex">
        <h1 className="mt-7 items-center text-[30px] font-bold">Sender's side</h1>
        </div>
        <div className="flex  w-full h-screen items-center justify-center flex-col space-y-8">
        <button className="text-white border-2 p-2 border-white rounded-lg font-bold text-[30px]" onClick={sendMessageOtheSide}>Send Video</button>
        <div className="w-[500px] h-[500px] object-contain">
          <video
            ref={LocalvideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full loc"
          ></video>

          <video
            ref={RemotevideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full rem"
          ></video>
        </div>
        </div>
        </>
    )
}