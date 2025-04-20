// Define API URL and endpoints for upload and download
const API_URL = "http://localhost:8080";
const UPLOAD_ENDPOINT = "/upload-file";
const DOWNLOAD_ENDPOINT = "/download";

// Open modal and reset content
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'flex';
  resetModal(modalId); // Clear previous modal content
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
  inputFields.forEach(input => input.value = ""); // Clear inputs
}

// Upload file function
async function uploadFile() {
  const fileInput = document.getElementById("uploadInput");
  const files = fileInput.files;
  const errorMsg = document.getElementById("uploadError");
  const successMsg = document.getElementById("uploadMessage");
  const pinSpan = document.getElementById("downloadPin");
  const pinContainer = document.getElementById("pinContainer");
  const copyPinButton = document.getElementById("copyPinButton");

  // Clear previous messages
  errorMsg.textContent = "";
  successMsg.textContent = "";

  // Check if files are selected
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
    successMsg.textContent = `File(s) uploaded!`;
    pinSpan.textContent = pin; // Display PIN in the span
    pinContainer.style.display = 'block'; // Show PIN container
    copyPinButton.style.display = 'inline-block'; // Ensure the copy button is visible
  } catch (err) {
    errorMsg.textContent = `Failed to upload: ${err.message}`;
    console.error(err);
  }
}

// Copy pin to clipboard
function copyPin() {
  const pinText = document.getElementById("downloadPin").textContent;
  navigator.clipboard.writeText(pinText).then(() => {
    alert('PIN copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy PIN:', err);
  });
}

// Download file function using PIN
async function downloadFile() {
  const pin = document.getElementById("pinInput").value;
  const errorMsg = document.getElementById("downloadError");
  const successMsg = document.getElementById("downloadMessage");

  // Clear previous messages
  errorMsg.textContent = "";
  successMsg.textContent = "";

  // Check if PIN is provided
  if (!pin) {
    errorMsg.textContent = "Please enter a PIN.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}${DOWNLOAD_ENDPOINT}?pin=${pin}`, { method: "GET" });

    if (!response.ok) throw new Error("File not found.");

    const blob = await response.blob();
    let filename = "downloaded-file";
    const disposition = response.headers.get("content-disposition");
    const originalName = response.headers.get("x-original-filename");

    // Get filename from headers if available
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match) filename = match[1];
    } else if (originalName) {
      filename = originalName;
    }

    // Download the file
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
