<script>
import KeyPage from './KeyPage.vue'
import MainPage from './MainPage.vue'
export default {
    name: 'app',
    components: {
        MainPage,
        KeyPage,
    },
    data() {
        return {
            message: '',
            keyQR: '',
            window: window
        }
    },
    methods: {

        compress(text) {
            return LZString.compressToUint8Array(text)
        },
        async buff(text) {
            let iv = window.crypto.getRandomValues(new Uint8Array(12));

            let cipherText = await window.crypto.subtle.encrypt({
                name: 'AES-GCM',
                iv: iv
            }, this.key, this.compress(text));

            return encodeURIComponent(this.encode(cipherText) + "|" + this.encode(iv));
        },
        async update() {
            var buffer = await this.buff(this.$refs.text.value)
            this.message = QRCode.generateHTML(buffer).innerHTML

        }
    }
}
</script>
<template>
<main>
  <key-page v-if="(!this.window.localStorage.getItem('encryptionKey') || !this.window.localStorage.getItem('rawKey'))"/>
  <main-page v-else/>
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
      background-color: #f8f8f8;
      font-size: 16px;
      resize: none;
    }
</style>
