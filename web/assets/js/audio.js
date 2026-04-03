let currentAudio = null;
let currentObjectUrl = "";

export function setAudioSource(playerElement, blob) {
  clearAudioSource(playerElement);
  currentObjectUrl = URL.createObjectURL(blob);
  playerElement.src = currentObjectUrl;
  currentAudio = playerElement;
  return currentObjectUrl;
}

export function clearAudioSource(playerElement) {
  if (playerElement) {
    playerElement.pause();
    playerElement.removeAttribute("src");
    playerElement.load();
  }

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
  }

  currentAudio = null;
  currentObjectUrl = "";
}

export function playAudio() {
  if (currentAudio?.src) {
    return currentAudio.play();
  }
}

export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
}

export function downloadBlob(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
