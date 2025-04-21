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

let encryptedData = {};

function generatePasskey() {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function encryptImage() {
    let file = document.getElementById('imageInput').files[0];
    if (!file) {
        showPopupMessage("❌ No image selected!");
        return;
    }

    let passkey = generatePasskey();
    let reader = new FileReader();

    reader.onload = function(event) {
        let base64Data = event.target.result;
        let encrypted = CryptoJS.AES.encrypt(base64Data, passkey).toString();
        encryptedData[passkey] = { type: 'image', data: encrypted };

        document.getElementById('imagePasskey').innerHTML = `<span class="green-text">Passkey: ${passkey}</span>`;
        showPopupMessage("✅ Image Encrypted!");

        // Optionally download encrypted content
        const blob = new Blob([encrypted], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        downloadFile(url, `encrypted_image_${passkey}.txt`);
        URL.revokeObjectURL(url);
    };

    reader.readAsDataURL(file);
}

function encryptText() {
    let text = document.getElementById('textInput').value;
    if (!text) {
        showPopupMessage("❌ No text entered!");
        return;
    }

    let passkey = generatePasskey();
    let encrypted = CryptoJS.AES.encrypt(text, passkey).toString();

    encryptedData[passkey] = { type: 'text', data: encrypted };
    document.getElementById('textPasskey').innerHTML = `<span class="green-text">Passkey: ${passkey}</span>`;
    showPopupMessage("✅ Text Encrypted!");

    const blob = new Blob([encrypted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `encrypted_text_${passkey}.txt`);
    URL.revokeObjectURL(url);
}

function decryptImage() {
    let passkey = document.getElementById('imageKeyInput').value;

    if (encryptedData[passkey] && encryptedData[passkey].type === 'image') {
        let decrypted = CryptoJS.AES.decrypt(encryptedData[passkey].data, passkey);
        let base64 = decrypted.toString(CryptoJS.enc.Utf8);

        document.getElementById('decryptedImage').src = base64;
        document.getElementById('decryptedImage').classList.remove('hidden');
        document.getElementById('imageError').textContent = "";

        delete encryptedData[passkey];
        showPopupMessage("✅ Image Decrypted!");
    } else {
        document.getElementById('imageError').textContent = "❌ Wrong Passkey!";
        document.getElementById('decryptedImage').classList.add('hidden');
    }
}

function decryptText() {
    let passkey = document.getElementById('textKeyInput').value;

    if (encryptedData[passkey] && encryptedData[passkey].type === 'text') {
        let decrypted = CryptoJS.AES.decrypt(encryptedData[passkey].data, passkey);
        let text = decrypted.toString(CryptoJS.enc.Utf8);

        document.getElementById('decryptedText').textContent = text;
        document.getElementById('textError').textContent = "";

        delete encryptedData[passkey];
        showPopupMessage("✅ Text Decrypted!");
    } else {
        document.getElementById('textError').textContent = "❌ Wrong Passkey!";
        document.getElementById('decryptedText').textContent = "";
    }
}

function downloadFile(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function showPopupMessage(message) {
    let popup = document.createElement("div");
    popup.className = "popup-message";
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 2000);
}


