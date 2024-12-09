const localPlayer = document.getElementById('localPlayer');
const remotePlayer = document.getElementById('remotePlayer');
(async function () {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localPlayer.srcObject = localStream;

  // 1. Utwórz dwie instancje RTCPeerConnection
  //    pc1 będzie nadawać stream, pc2 wyłącznie go odbierać
  const pc1 = new RTCPeerConnection();
  const pc2 = new RTCPeerConnection();

  // 2. Zaimplementuj w obu PC `onicecandidate` tak, by przekazywały sobie nawzajem swoich kandydatów
  pc1.onicecandidate = async (ev) => {
    // await pc2.???(ev.candidate);
  };
  pc2.onicecandidate = undefined;

  // 3. Zaimplementuj w pc2 callback `ontrack`, by przypiąć otrzymany stream do elementu wideo `remotePlayer`
  pc2.ontrack = (ev) => {
    // remotePlayer.??? = ev.streams[0];
  };

  localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));

  const offer = await pc1.createOffer();
  await pc1.setLocalDescription(offer);

  // 4. Zaaplikuj ofertę w pc2

  // 5. Utwórz i zaaplikuj odpowiedź w pc2

  // 6. Zaaplikuj odpowiedź w pc1
})();
