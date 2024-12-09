const localPlayer = document.getElementById('localPlayer');
const remotePlayer = document.getElementById('remotePlayer');

(async function () {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localPlayer.srcObject = localStream;

  const pc = new RTCPeerConnection();

  // 1. Dodaj event handler, który wypisze każdego znalezionego kandydata

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  const offer = await pc.createOffer();
  // 2. Zaaplikuj utworzoną ofertę w pc


  // 3. Zmieniaj konfigurację przekazywaną do konstruktora RTCPeerConnection
  //    i obserwuj, co się dzieje
})();
