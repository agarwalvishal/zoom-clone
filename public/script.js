const socket = io('/'); // Socket will connect to '/' - the root path of our application.
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

const peer = new Peer(undefined, {
  host: '/',
  port: '3000',
  path: '/peerjs'
});

const peers = {};

// ask for audio and video webrtc permissions
navigator.mediaDevices.getUserMedia({
  audio: false, // TODO: Revert to true
  video: true
}).then(stream => {
  addVideoStream(myVideo, stream);
  
  peer.on('call', call => {
    const video = document.createElement('video');

    call.answer(stream);

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
