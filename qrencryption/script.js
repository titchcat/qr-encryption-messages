function encode(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function decode(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
async function decryptMessage(privateKey, ciphertext, iv) {
    let realKey = await window.crypto.subtle.importKey('raw', decode(privateKey), 'AES-GCM', true, ['encrypt', 'decrypt']).catch(e => {
        document.getElementById('error').innerHTML = 'Invalid Key QR Code';
        return;
    })
    return window.crypto.subtle.decrypt({
            name: "AES-GCM",
            iv: (iv)
        },
        realKey,
        ciphertext
    );
}

function reset() {
    scanned = [];
    document.getElementById('navigation-dropdown').innerHTML = 'None'
    document.getElementById('spin').innerHTML = 'Scan the key'
}

function toggleClass(el, className) {
    if (el) {
        if (el.className.indexOf(className) != -1) {
            el.className = el.className.replace(className, '');
        } else {
            el.className += ' ' + className;
        }
    }
};
async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function spinElement(el) {
    el = document.getElementById(el)
    let ogClass = el.className
    console.log(ogClass)
    el.className = 'fa-spin'
    console.log(ogClass)
    await wait(1000);
    el.className = ogClass
}

function setHeight() {
    var el = document.getElementById('navigation-dropdown');
    el.style.height = el.clientHeight + "px";
}
setHeight();

function dropIt() {
    toggleClass(document.getElementById('navigation-dropdown'), "hide");
}

function copyText() {
    var copyText = document.getElementById("navigation-dropdown").innerHTML;
    navigator.clipboard.writeText(copyText);
    document.getElementById('copy').hidden = true
    document.getElementById('check').hidden = false
}