// Define API URL and endpoints for upload and download
const API_URL = "http://file.cloud-ninja.xyz:80";
const UPLOAD_ENDPOINT = "/upload-file";
const DOWNLOAD_ENDPOINT = "/download";

// Open modal and reset content
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'flex';
  resetModal(modalId);
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'none';
}

// Reset modal content (clear messages, inputs)
function resetModal(modalId) {
  const modal = document.getElementById(modalId);
  const errorMsg = modal.querySelector('.error-message');
  const successMsg = modal.querySelector('.success-message');
  const inputFields = modal.querySelectorAll('input');

  errorMsg.textContent = "";
  successMsg.textContent = "";
  inputFields.forEach(input => input.value = "");

  if (modalId === "uploadModal") {
    document.getElementById("pinContainer").style.display = "none";
    document.getElementById("copyPinButton").style.display = "none";
  }
}

// Upload file function
async function uploadFile() {
  const fileInput = document.getElementById("uploadInput");
  const files = fileInput.files;
  const errorMsg = document.getElementById("uploadError");
  const successMsg = document.getElementById("uploadMessage");
  const pinInput = document.getElementById("downloadPin");
  const pinContainer = document.getElementById("pinContainer");
  const copyPinButton = document.getElementById("copyPinButton");

  errorMsg.textContent = "";
  successMsg.textContent = "";

  if (!files.length) {
    errorMsg.textContent = "Please select at least one file.";
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("file", files[i]);
  }

  try {
    const response = await fetch(`${API_URL}${UPLOAD_ENDPOINT}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed.");

    const pin = await response.text();
    successMsg.textContent = "File(s) uploaded!";
    pinInput.value = pin; // Set the PIN value in the input
    pinContainer.style.display = "block";
    copyPinButton.style.display = "inline-block";
  } catch (err) {
    errorMsg.textContent = `Failed to upload: ${err.message}`;
    console.error(err);
  }
}

// Copy PIN to clipboard
function copyPin() {
  const pinInput = document.getElementById("downloadPin");
  const pinText = pinInput.value;

  if (!pinText) {
    alert("No PIN to copy.");
    return;
  }

  pinInput.select();
  pinInput.setSelectionRange(0, 99999); // Mobile support

  navigator.clipboard.writeText(pinText).then(() => {
    alert("PIN copied to clipboard!");
  }).catch(err => {
    console.error("Failed to copy PIN:", err);
    alert("Copy failed. Please try manually.");
  });
}

// Download file using PIN
async function downloadFile() {
  const pin = document.getElementById("pinInput").value.trim();
  const errorMsg = document.getElementById("downloadError");
  const successMsg = document.getElementById("downloadMessage");

  errorMsg.textContent = "";
  successMsg.textContent = "";

  if (!pin) {
    errorMsg.textContent = "Please enter a PIN.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}${DOWNLOAD_ENDPOINT}?pin=${pin}`, {
      method: "GET"
    });

    if (!response.ok) throw new Error("File not found.");

    const blob = await response.blob();
    let filename = "downloaded-file";
    const disposition = response.headers.get("content-disposition");
    const originalName = response.headers.get("x-original-filename");

    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match) filename = match[1];
    } else if (originalName) {
      filename = originalName;
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    successMsg.textContent = "File downloaded successfully!";
  } catch (err) {
    errorMsg.textContent = `Download failed: ${err.message}`;
    console.error(err);
  }
}
