const localPlayer = document.getElementById('localPlayer');
const remotePlayer = document.getElementById('remotePlayer');

(async function () {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localPlayer.srcObject = localStream;

  // 1. Stwórz instancję RTCPeerConnection
  const pc = new RTCPeerConnection();

  // 2. Dodaj oba tracki ze streamu do pc
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  // 3. Utwórz ofertę w pc
  const offer = await pc.createOffer();

  // 4 Wypisz ofertę w konsoli
  console.log(offer.sdp);
})();
