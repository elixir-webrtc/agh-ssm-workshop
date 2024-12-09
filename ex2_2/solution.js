const localPlayer = document.getElementById('localPlayer');
const remotePlayer = document.getElementById('remotePlayer');

(async function () {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localPlayer.srcObject = localStream;

  const pc = new RTCPeerConnection({
    bundlePolicy: "max-bundle",
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: [
          "turn:bigfish.jellyfish.ovh:3478?transport=udp",
          "turn:bigfish.jellyfish.ovh:3478?transport=tcp",
          "turns:bigfish.jellyfish.ovh:3478?transport=tcp"
        ],
        username: "turnuser",
        credential: "c1gAaF2Arycz7I3CKd4QvA"
      }
    ]
  });

  // 1. Dodaj event handler, który wypisze każdego znalezionego kandydata
  pc.onicecandidate = (ev) => {console.log(ev.candidate);};

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  const offer = await pc.createOffer();

  // 2. Zaaplikuj utworzoną ofertę w pc
  await pc.setLocalDescription(offer);
})();
