const socket = io('/')
const videoGrid = document.getElementById('video-grid')

// DECLARATION OF PEER

const myPeer = new Peer(undefined, { host: "peerjs-server.herokuapp.com", secure: true, port: 443, });

let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}

// for connecting  audio and video of users
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
    audio: {
        echoCancellation: true,
        noiseSuppression: true
    }
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
    myPeer.on('call', call => {
        call.answer(stream)

        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
            connectToNewUser(userId, stream)
        })
        // input value
    let text = $("input");
    // when press enter send message
    $('html').keydown(function(e) {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('')
        }
    });
    let usernamee = "";
    socket.on("createMessage", message => {
        $("ul").append(`<li class="message"><b>User</b><br/>${message}</li>`);
        scrollToBottom()
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

// APPENDING VIDEO CALL

/**
 * 
 * @param {} video video of new user that is recently connected
 * @param {} stream audio and video  that we are  trying to fetch
 */
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

//MAKING CHAT SCROLLABLE
const scrollToBottom = () => {
        var d = $('.main__chat_window');
        d.scrollTop(d.prop("scrollHeight"));
    }
    //MUTE UNMUTE AND HIDE UNHIDE VIDEO 
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}
const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
        const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
        document.querySelector('.main__video_button').innerHTML = html;
    }
    //changing viedo icon
const setPlayVideo = () => {
    const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

//SHARE SCREEN FUNCTION
/**
 * 
 * @returns  A Promise whose fulfillment handler receives a MediaStream object when the requested media
 *  has successfully been obtained.  when the requested media
   has successfully been obtained the handler will be receing a MediaStream object
 */
function shareScreen() {
    return navigator.mediaDevices.getDisplayMedia({
        video: {
            cursor: "always"
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
        }
    }).then((stream) => {
        let getVideoTrack = stream.getVideoTracks()[0];
        console.log(getVideoTrack)
        let sender = myPeer.getSenders().find(function(s) {
            return s.track.kind == videoTrack.kind
        })
        sender.replaceTrack(myVideo)
    }).catch((err) => {
        console.log("unable to get displaymedia" + err)
    })

}