let pc;

const localPlayer = document.getElementById('localPlayer');
const remotePlayer = document.getElementById('remotePlayer');

// 1. Uzupełnij nr swojej grupy
const groupId = undefined;

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

// 3. Gdy otrzymasz od drugiej strony kandydata, dodaj go do swojego pc
async function handleCandidate(candidate) {
}

// 5. Gdy otrzymasz ofertę:
async function handleOffer(offer) {
  // 5.1. Zaaplikuj ofertę

  // 5.2. Utwórz i zaaplikuj odpowiedź

  // 5.3. Przekaż odpowiedź drugiej stronie
}

async function init() {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  localPlayer.srcObject = localStream;

  pc = new RTCPeerConnection();

  pc.onicecandidate = async (ev) => {
    // 2. Gdy wygenerujemy kandydata, przekaż go drugiej stronie
  };

  pc.ontrack = (ev) => {
    remotePlayer.srcObject = ev.streams[0];
  };

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  // ...i tyle, czekamy na oferującego :)
}

init();


// Funkcje pomocnicze

function connectSignaling(id) {
  const sock = new WebSocket(`wss://bigfish.jellyfish.ovh/signaling/${id}`);
  sock.addEventListener("open", () => {
    console.log(`Signaling socket open (server ${id})`);
  });

  return sock;
}

function offerToMsg(offer) {
  return JSON.stringify({
    type: 'offer',
    sdp: offer.sdp
  })
}

function answerToMsg(answer) {
  return JSON.stringify({
    type: 'answer',
    sdp: answer.sdp
  })
}

function candidateEventToMsg(event) {
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
