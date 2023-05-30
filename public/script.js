const socket = io('/'); // Socket will connect to '/' - the root path of our application.
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

const peer = new Peer(undefined, {
  host: '/',
  port: PEER_PORT || 443, // PEER_PORT is set in the dev environment and defaults to 443 for production
  path: '/peerjs'
});

let myVideoStream = null;
const peers = {};
let myUserId = null;

// ask for audio and video webrtc permissions
navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);
  
  // Listen for a new call
  peer.on('call', call => {
    const video = document.createElement('video');

    call.answer(stream);

    // Upon receiving the stream from the other peer, add it to the video stream
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  });
  
  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream);
  });
}).catch(error => {
  console.log('Failed to get local stream', error);
});

socket.on('user-disconnected', userId => {
  if (peers[userId]) {
    peers[userId].close();
  }
});

peer.on('open', id => {
  console.log('peer id: ' + id);
  myUserId = id;
  socket.emit('join-room', ROOM_ID, id);
});

// Helper functions
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}

const connectToNewUser = (userId, stream) => {
  call = peer.call(userId, stream);
  const video = document.createElement('video');

  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  
  call.on('close', () => {
    video.remove();
    console.log('User disconnected');
  });

  // Keep track of connected users and which call they're connected to
  // so that they can be removed from the video grid when they disconnect
  peers[userId] = call;
}

// Use jQuery to  get the text from the input element
let text = $('input');

// Use jQuery to listen for the enter key being pressed
$('html').keydown(e => {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit('message', text.val(), myUserId);
    text.val('');
  }
});

// Listen for messages from the server
socket.on('create-message', (message, userId) => {
  console.log('create-message', message);
  $('.messages').append(`<li class="message"><b>${userId}</b><br/>${message}</li>`);
  scrollToBottom();
});

// Scroll to the bottom of the chat window when a new message is added
const scrollToBottom = () => {
  let d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
};

// Mute/Unmute functionality
const muteUnmute = () => {
  // const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (myVideoStream.getAudioTracks()[0].enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  console.log('setMuteButton');
  const html = `
    <i class="fa-solid fa-microphone"></i>
    <span>Mute</span>
  `
  setHTML('.main__mute_button',  html);
}

const setUnmuteButton = () => {
  console.log('setUnmuteButton');
  const html = `
    <i class="unmute fa-solid fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  setHTML('.main__mute_button',  html);
}

const playStop = () => {
  // const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (myVideoStream.getVideoTracks()[0].enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setPlayVideo = () => {
  console.log('setPlayVideo');
  const html = `
    <i class="stop__video fa-solid fa-video-slash"></i>
    <span>Play Video</span>
  `
  setHTML('.main__video_button',  html);
}

const setStopVideo = () => {
  console.log('setStopVideo');
  const html = `
  <i class="fa-solid fa-video"></i>
  <span>Stop Video</span>
  `
  setHTML('.main__video_button',  html);
}

const setHTML = (classId, html) => {
  document.querySelector(classId).innerHTML = html;
}
