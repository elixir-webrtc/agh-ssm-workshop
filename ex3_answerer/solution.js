let pc;

const localPlayer = document.getElementById('localPlayer');
const remotePlayer = document.getElementById('remotePlayer');

// 1. Uzupełnij nr swojej grupy
const groupId = 1;

// Setup signaling socketu
const sock = connectSignaling(groupId);
sock.addEventListener("message", (msg) => {
  const data = JSON.parse(msg.data);
  switch(data.type) {
    case 'offer':
      handleOffer(data);
      break;
    case 'candidate':
      handleCandidate(data);
      break;
    default:
      break;
  }
})

// 2. Gdy otrzymasz od drugiej strony kandydata, dodaj go do swojego pc
async function handleCandidate(candidate) {
  if (candidate.candidate == null) {
    await pc.addIceCandidate(null);
  } else {
    await pc.addIceCandidate(candidate);
  }
}

// 3. Gdy otrzymasz ofertę:
async function handleOffer(offer) {
  // 3.1. Zaaplikuj ofertę
  await pc.setRemoteDescription(offer);

  // 3.2. Utwórz i zaaplikuj odpowiedź
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  // 3.3. Przekaż odpowiedź drugiej stronie
  const answerMsg = answerToMsg(answer);
  sock.send(answerMsg);
}

async function init() {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localPlayer.srcObject = localStream;

  pc = new RTCPeerConnection();

  pc.onicecandidate = async (ev) => {
    // 4. Gdy wygenerujemy kandydata, przekaż go drugiej stronie
    const msg = candidateEventToMsg(ev);
    sock.send(msg);
  };

  pc.ontrack = (ev) => {
    remotePlayer.srcObject = ev.streams[0];
  };

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  // ...i tyle, czekamy na oferującego :)
}

init();


// Funkcje pomocnicze

export function connectSignaling(id) {
  const sock = new WebSocket(`wss://bigfish.jellyfish.ovh/signaling/${id}`);
  sock.addEventListener("open", () => {
    console.log(`Signaling socket open (server ${id})`);
  });

  return sock;
}

export function offerToMsg(offer) {
  return JSON.stringify({
    type: 'offer',
    sdp: offer.sdp
  })
}

export function answerToMsg(answer) {
  return JSON.stringify({
    type: 'answer',
    sdp: answer.sdp
  })
}

export function candidateEventToMsg(event) {
  const message = {
    type: 'candidate',
    candidate: null,
  };

  if (event.candidate) {
    message.candidate = event.candidate.candidate;
    message.sdpMid = event.candidate.sdpMid;
    message.sdpMLineIndex = event.candidate.sdpMlineIndex;
  }

  return JSON.stringify(message);
}
