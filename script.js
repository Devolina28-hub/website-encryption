// Navigation Functions
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById('home').classList.add('hidden');
    document.getElementById(pageId).classList.remove('hidden');
}

function goHome() {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById('home').classList.remove('hidden');
    resetFields();
}

function showEncryptPage() { showPage('encryptPage'); resetFields(); }
function showDecryptPage() { showPage('decryptPage'); resetFields(); }
function showImageEncrypt() { showPage('imageEncryptPage'); resetFields(); }
function showTextEncrypt() { showPage('textEncryptPage'); resetFields(); }
function showImageDecrypt() { showPage('imageDecryptPage'); resetFields(); }
function showTextDecrypt() { showPage('textDecryptPage'); resetFields(); }

// Reset Fields
function resetFields() {
    document.getElementById('imageInput').value = "";
    document.getElementById('textInput').value = "";
    document.getElementById('imagePasskey').textContent = "";
    document.getElementById('textPasskey').textContent = "";
    document.getElementById('imageKeyInput').value = "";
    document.getElementById('textKeyInput').value = "";
    document.getElementById('imageError').textContent = "";
    document.getElementById('textError').textContent = "";
    document.getElementById('decryptedImage').classList.add('hidden');
    document.getElementById('decryptedText').textContent = "";
}

// Simple XOR encryption function
function xorEncrypt(data, key) {
    return data.split('').map((char, index) => {
        const keyChar = key.charCodeAt(index % key.length);
        return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    }).join('');
}

// Base64 encode after encryption
function encryptData(data, passkey) {
    const encrypted = xorEncrypt(data, passkey);
    return btoa(encrypted);
}

// Base64 decode before decryption
function decryptData(encryptedData, passkey) {
    const decoded = atob(encryptedData);
    return xorEncrypt(decoded, passkey);
}

// Generate Unique Passkey
function generatePasskey() {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
}

// Save to Local Storage
function saveToLocalStorage(passkey, data) {
    const encryptedItems = JSON.parse(localStorage.getItem('encryptedItems')) || {};
    encryptedItems[passkey] = data;
    localStorage.setItem('encryptedItems', JSON.stringify(encryptedItems));
}

// Get from Local Storage
function getFromLocalStorage(passkey) {
    const encryptedItems = JSON.parse(localStorage.getItem('encryptedItems')) || {};
    return encryptedItems[passkey];
}

// Remove from Local Storage
function removeFromLocalStorage(passkey) {
    const encryptedItems = JSON.parse(localStorage.getItem('encryptedItems')) || {};
    delete encryptedItems[passkey];
    localStorage.setItem('encryptedItems', JSON.stringify(encryptedItems));
}

// Encrypt Image
function encryptImage() {
    let file = document.getElementById('imageInput').files[0];
    if (!file) {
        showPopupMessage("❌ No image selected!");
        return;
    }

    let passkey = generatePasskey();
    let reader = new FileReader();

    reader.onload = function(event) {
        // Get the Base64 data without the prefix
        const base64Data = event.target.result.split(',')[1];
        
        // Encrypt the data
        const encryptedData = encryptData(base64Data, passkey);
        
        // Create a data URL for the encrypted image
        const encryptedImageUrl = `data:image/png;base64,${encryptedData}`;
        
        // Save to storage
        const encryptedItem = { 
            type: 'image', 
            data: encryptedImageUrl,
            originalData: event.target.result, // Store original for decryption
            timestamp: new Date().toISOString()
        };
        
        saveToLocalStorage(passkey, encryptedItem);
        
        // Show passkey and encrypted image preview
        document.getElementById('imagePasskey').innerHTML = `
            <span class="green-text">Passkey: ${passkey}</span>
            <br>
            <button class="futuristic-button small" onclick="downloadPasskey('${passkey}')">Download Passkey</button>
            <div class="image-preview">
                <h3>Encrypted Image Preview:</h3>
                <img src="${encryptedImageUrl}" style="max-width: 200px; border: 1px solid red;">
                <p class="note">Note: This is what the encrypted image looks like</p>
            </div>
        `;
        
        showPopupMessage("✅ Image Encrypted and Saved!");
    };

    reader.readAsDataURL(file);
}

// Encrypt Text
function encryptText() {
    let text = document.getElementById('textInput').value;
    if (!text) {
        showPopupMessage("❌ No text entered!");
        return;
    }

    let passkey = generatePasskey();
    const encryptedItem = { 
        type: 'text', 
        data: text,
        timestamp: new Date().toISOString()
    };
    saveToLocalStorage(passkey, encryptedItem);

    document.getElementById('textPasskey').innerHTML = `
        <span class="green-text">Passkey: ${passkey}</span>
        <br>
        <button class="futuristic-button small" onclick="downloadPasskey('${passkey}')">Download Passkey</button>
    `;
    showPopupMessage("✅ Text Encrypted and Saved!");
}

// Decrypt Image
function decryptImage() {
    let passkey = document.getElementById('imageKeyInput').value.trim();
    const encryptedItem = getFromLocalStorage(passkey);

    if (encryptedItem && encryptedItem.type === 'image') {
        try {
            // Get the encrypted Base64 data without the prefix
            const encryptedData = encryptedItem.data.split(',')[1];
            
            // Decrypt the data
            const decryptedData = decryptData(encryptedData, passkey);
            
            // Create a data URL for the decrypted image
            const decryptedImageUrl = `data:image/png;base64,${decryptedData}`;
            
            document.getElementById('decryptedImage').src = decryptedImageUrl;
            document.getElementById('decryptedImage').classList.remove('hidden');
            document.getElementById('imageError').textContent = "";

            removeFromLocalStorage(passkey);
            showPopupMessage("✅ Image Decrypted!");
        } catch (e) {
            document.getElementById('imageError').textContent = "❌ Failed to decrypt - wrong passkey?";
            document.getElementById('decryptedImage').classList.add('hidden');
        }
    } else {
        document.getElementById('imageError').textContent = "❌ Wrong Passkey or Data Not Found!";
        document.getElementById('decryptedImage').classList.add('hidden');
    }
}

// Decrypt Text
function decryptText() {
    let passkey = document.getElementById('textKeyInput').value.trim();
    const encryptedItem = getFromLocalStorage(passkey);

    if (encryptedItem && encryptedItem.type === 'text') {
        document.getElementById('decryptedText').textContent = encryptedItem.data;
        document.getElementById('textError').textContent = "";

        removeFromLocalStorage(passkey);
        showPopupMessage("✅ Text Decrypted!");
    } else {
        document.getElementById('textError').textContent = "❌ Wrong Passkey or Data Not Found!";
        document.getElementById('decryptedText').textContent = "";
    }
}

// Download Passkey as File
function downloadPasskey(passkey) {
    const blob = new Blob([passkey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passkey-${passkey}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Show Popup Messages
function showPopupMessage(message) {
    let popup = document.createElement("div");
    popup.className = "popup-message";
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 2000);
}
