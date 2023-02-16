<script>
import QRCode from 'qrcode';

export default {
    name: 'MainPage',
    data() {
        return {
            message: '',
            keyQR: '',
            clicks: 0
        }
    },
    setup() {

        //if (window.localStorage.getItem('encryptionKey')) QRCode.toCanvas(window.localStorage.getItem('encryptionKey'), {errorCorrectionLevel: 'L'}, function(err, canvas) {document.getElementById('canvas').appendChild(canvas)})
    },
    mounted: function() {
        var scriptTag = document.createElement("script");
        scriptTag.setAttribute('src', '../../lz-string.js')

        document.getElementsByTagName('main')[0].appendChild(scriptTag);
        var scriptTag2 = document.createElement("script");
        scriptTag2.setAttribute('src', 'qrcode.js');
        scriptTag2.async = true;
        scriptTag2.defer = true;
        document.getElementsByTagName('main')[0].appendChild(scriptTag2);
    },
    methods: {
        async decryptMessage(privateKey, ciphertext) {
            let realKey = await window.crypto.subtle.importKey('raw', this.decode(privateKey), 'AES-GCM', true, ['encrypt', 'decrypt'])
            return window.crypto.subtle.decrypt({
                    name: "AES-GCM",
                    iv: this.decode(decodeURIComponent(this.encrypted.split('%3D%3D%7C')[1]))
                },
                realKey,
                ciphertext
            );
        },
        encode(buffer) {
            var binary = '';
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        },
        decode(base64) {
            var binary_string = window.atob(base64);
            var len = binary_string.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                bytes[i] = binary_string.charCodeAt(i);
            }
            return bytes.buffer;
        },
        keyQRRender() {
            this.clicks++
            if (this.clicks > 1) return this.spinElement('canvas')
            if (window.localStorage.getItem('encryptionKey')) {
                QRCode.toCanvas(window.localStorage.getItem('rawKey'), {
                    errorCorrectionLevel: 'L'
                }, function(err, canvas) {
                    if (err) throw err;
                    document.getElementById('canvas').innerHTML = '';
                    document.getElementById('canvas').appendChild(canvas)
                })
            } else {
                document.getElementById('error').innerHTML = 'what the hell'
            }
        },
        compress(text) {
            return LZString.compressToUint8Array(text)
        },
        async buff(text) {
            let iv = window.crypto.getRandomValues(new Uint8Array(12));
            let actualKey = await window.crypto.subtle.importKey('raw', this.decode(window.localStorage.getItem('rawKey')), 'AES-GCM', true, ['encrypt', 'decrypt'])
            let cipherText = await window.crypto.subtle.encrypt({
                name: 'AES-GCM',
                iv: iv
            }, actualKey, this.compress(text));

            return encodeURIComponent(this.encode(cipherText) + "|" + this.encode(iv));
        },
        async msgQRRender() {
            if (!this.$refs.text.value) return document.getElementById('messageQR').innerHTML = '<br>Please enter some text!'
            let buffer = await this.buff(this.$refs.text.value);
            try {
                document.getElementById('error').innerHTML = ''
                QRCode.toCanvas(buffer, {
                    errorCorrectionLevel: 'L'
                }, function(err, canvas) {
                    if (err) throw err;
                    document.getElementById('messageQR').innerHTML = '';
                    document.getElementById('messageQR').appendChild(canvas);
                })

            } catch (e) {

                if (String(e).includes('too big')) {
                    document.getElementById('messageQR').innerHTML = '';
                    document.getElementById('error').innerHTML = 'Too much text!'
                } else {
                    document.getElementById('error').innerHTML = 'An error occured - invalid text'
                }
            }
        },
        async decrypt() {
            let msg = LZString.decompressFromUint8Array(new Uint8Array(await this.decryptMessage(this.key, this.decode(decodeURIComponent(this.encrypted.split('%3D%3D%7C')[0])))))
            console.log(msg)
        },
        async wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        async spinElement(el) {
            el = document.getElementById(el)
            let ogClass = el.className
            el.className = 'fa-spin'
            await this.wait(2000);
            el.className = ogClass
        }
    }
}
</script>
<template>
  <main class="whole"><h1><center><div class="title">Enter your text!</div></center></h1>
    <font color="red" id="error"></font>
    <textarea  placeholder="Enter your message..." ref="text" class="textarea-1" name="input" id="input"></textarea>
    <br><br>
    <button @click="this.msgQRRender" class="button-54">Encrypted message</button>
    <br><center><div id="messageQR"></div></center><br>
    <button @click="this.keyQRRender" class="button-54">Key QR Code</button>
    <br>
    <center><div id="canvas" style="background:white;width:150px"></div></center>
    <br><br><br>
    </main>
    </template>
    
    <style scoped>
.textarea-1 {
      width: 100%;
      height: 150px;
      padding: 12px 20px;
      box-sizing: border-box;
      border: 2px solid #ccc;
      border-radius: 4px;
      background-color: #b6b6b6;
      font-size: 16px;
      resize: none;
    }
</style>
