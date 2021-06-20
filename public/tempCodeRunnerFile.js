const socket  = io();
// const VdioGrid=document.getElementById('video-grid');
// const MyVdio=document.createElement('video');
// MyVdio.muted=true;
// let MyvdioStream;
// navigator.mediaDevices.getUserMedia({
//     video:true,
//     audio: true
// }).then(stream=>{
//  MyvdioStream=stream
//  addVideoStream(MyVdio,stream);
// },
//  err=>console.log(err)
// )

// // socket.emit('join-room');

// const addVideoStream=(video,stream)=>{
//    video.srcObject=stream;
//    video.addEventListener('loadedmetadata',()=>{
//        video.play();
//    })
//    VdioGrid.append(video);
// }