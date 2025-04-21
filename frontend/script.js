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
  const spinner = document.getElementById("uploadSpinner"); // Get spinner

  // Clear previous messages and hide PIN
  errorMsg.textContent = "";
  successMsg.textContent = "";
  pinContainer.style.display = 'none';
  copyPinButton.style.display = 'none';

  // Check if files are selected
  if (!files.length) {
    errorMsg.textContent = "Please select at least one file.";
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append("file", files[i]);
  }

  spinner.style.display = 'block'; // Show spinner

  try {
    const response = await fetch(`${API_URL}${UPLOAD_ENDPOINT}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
        const errorBody = await response.text(); // Try to get error body
        throw new Error(errorBody || "Upload failed.");
    }

    const pin = await response.text();
    successMsg.textContent = `File(s) uploaded!`;
    pinSpan.textContent = pin; // Display PIN in the span
    pinContainer.style.display = 'block'; // Show PIN container
    copyPinButton.style.display = 'inline-block'; // Ensure the copy button is visible
  } catch (err) {
    errorMsg.textContent = `Failed to upload: ${err.message}`;
    console.error(err);
  } finally {
    spinner.style.display = 'none'; // Hide spinner regardless of outcome
  }
}

// Copy pin to clipboard
function copyPin() {
  const pinText = document.getElementById("downloadPin").textContent;
  const copyButton = document.getElementById("copyPinButton");
  const originalButtonText = copyButton.textContent; // Store original text
  const errorMsg = document.getElementById("uploadError"); // Reusing upload error for simplicity, consider a dedicated element

  // Clear previous copy-related errors
  if (errorMsg.dataset.source === 'copy') {
      errorMsg.textContent = "";
      errorMsg.dataset.source = '';
  }

  // Check if Clipboard API is available
  if (!navigator.clipboard) {
    errorMsg.textContent = "Clipboard access requires a secure connection (HTTPS) or localhost. Please copy the PIN manually.";
    errorMsg.dataset.source = 'copy'; // Mark the error source
    console.error("Clipboard API not supported or context is insecure.");
    return;
  }

  navigator.clipboard.writeText(pinText).then(() => {
    // Provide visual feedback on the button
    copyButton.textContent = 'Copied!';
    copyButton.disabled = true; // Briefly disable button
    copyButton.classList.add('copied'); // Add class for styling feedback

    // Revert button text and style after a short delay
    setTimeout(() => {
      copyButton.textContent = originalButtonText;
      copyButton.disabled = false;
      copyButton.classList.remove('copied'); // Remove feedback class
    }, 1500); // Revert after 1.5 seconds

  }).catch(err => {
    console.error('Failed to copy PIN:', err);
    // Display a specific error message for copy failure
    errorMsg.textContent = "Failed to copy PIN. Please copy it manually.";
    errorMsg.dataset.source = 'copy'; // Mark the error source

    // Optionally provide visual feedback for failure
    copyButton.textContent = 'Copy Failed';
    copyButton.classList.add('copy-failed'); // Add class for styling feedback
     setTimeout(() => {
      copyButton.textContent = originalButtonText;
      copyButton.classList.remove('copy-failed'); // Remove feedback class
    }, 2000);
  });
}

// Download file function using PIN
async function downloadFile() {
  const pin = document.getElementById("pinInput").value;
  const errorMsg = document.getElementById("downloadError");
  const successMsg = document.getElementById("downloadMessage");
  const spinner = document.getElementById("downloadSpinner"); // Get spinner

  // Clear previous messages
  errorMsg.textContent = "";
  successMsg.textContent = "";

  // Check if PIN is provided
  if (!pin) {
    errorMsg.textContent = "Please enter a PIN.";
    return;
  }

  spinner.style.display = 'block'; // Show spinner

  try {
    const response = await fetch(`${API_URL}${DOWNLOAD_ENDPOINT}?pin=${pin}`, { method: "GET" });

    if (!response.ok) {
        let errorText = "Download failed.";
        if (response.status === 404) {
            errorText = "File not found or PIN is invalid.";
        } else if (response.status === 403) {
            errorText = "File has expired or already downloaded.";
        } else {
             const errorBody = await response.text(); // Try to get error body
             errorText = errorBody || `Server error: ${response.status}`;
        }
        throw new Error(errorText);
    }

    const blob = await response.blob();
    let filename = "downloaded-file";
    const disposition = response.headers.get("content-disposition");
    // Use the original filename from the backend if available
    const originalName = response.headers.get("x-original-filename");

    // Get filename from headers if available
    if (disposition) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    } else if (originalName) { // Fallback to custom header if content-disposition is missing/malformed
      filename = originalName;
    } // <<< Added missing closing brace

    // Download the file
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url); // Clean up blob URL

    successMsg.textContent = "File downloaded successfully!";
  } catch (err) {
    errorMsg.textContent = `Download failed: ${err.message}`;
    console.error(err);
  } finally {
    spinner.style.display = 'none'; // Hide spinner regardless of outcome
  }
}
