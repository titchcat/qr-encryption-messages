<script>
export default {
    name: 'KeyPage',
    data() {
        return {
            window: window
        }
    },
    methods: {
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
        async generateKey() {
            let key = await window.crypto.subtle.generateKey({
                name: 'AES-GCM',
                length: 128
            }, true, ['encrypt', 'decrypt'])
            await window.crypto.subtle.exportKey("raw", key).then(x => {
                this.window.localStorage.setItem("encryptionKey", key)
                this.window.localStorage.setItem('rawKey', this.encode(x))

            }).catch(e => console.log(e))


            location.reload()
        },

    }
}
</script>

<template>
    <main><center>
        <h1>You don't have a key yet!</h1>        
        <button @click="generateKey()" class="button-54">Generate a key</button>
        </center></main>
</template>