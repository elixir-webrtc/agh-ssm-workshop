const localPlayer = document.getElementById('localPlayer');
const remotePlayer = document.getElementById('remotePlayer');

(async function () {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localPlayer.srcObject = localStream;

  // 1. Stwórz instancję RTCPeerConnection
  const pc = undefined;

  // 2. Dodaj oba tracki ze streamu do pc

  // 3. Utwórz ofertę w pc

  // 4 Wypisz ofertę w konsoli
})();
