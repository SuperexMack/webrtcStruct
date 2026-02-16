"use client"

import { useEffect, useRef } from "react"

export default function(){

    const socket = useRef<WebSocket|null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    
    useEffect(()=>{
          socket.current = new WebSocket("ws://localhost:9000")
          socket.current.onopen = (()=>{
            socket.current?.send(JSON.stringify({
                msg:"REMOTE"
            }))
        })
        const pc = new RTCPeerConnection()

        if(socket.current){
        socket.current.onmessage = async(alldata)=>{
            let allmessage = JSON.parse(alldata.data)
            if(allmessage.msg === "create-offer"){
                await pc.setRemoteDescription(allmessage.sdp)
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                socket.current?.send(JSON.stringify({msg:"create-answer",sdp:pc.localDescription}))
            }
            else if(allmessage.msg === "ice-candidate"){
                await pc.addIceCandidate(allmessage.candidate)
            }
        }

    }

    const caller =  async()=>{
       const stream = await navigator.mediaDevices.getUserMedia({audio:true,video:true})

       stream.getTracks().forEach((track:any)=>pc.addTrack(track,stream))


        pc.ontrack = (event)=>{
          if(videoRef.current){
            console.log("We are getting the video")
            videoRef.current.srcObject = event.streams[0]
          }
        }
    }

    caller()

    },[])

    



    return(
        <>
        <div className="flex  flex-col space-y-5 items-center justify-center">
        <h1 className="mt-7 text-[30px] font-bold">Receiver's side</h1>
        <div className="w-[500px] h-[500px] object-contain">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full"
          ></video>
        </div>
        </div>
        </>
    )
}