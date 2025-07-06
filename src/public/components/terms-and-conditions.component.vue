<template>
  <div v-if="visible" class="tc-modal-backdrop" @click.self="close">
    <div class="tc-modal-content">
      <h2>{{ $t('terms-and-conditions.title') }}</h2>
      <div
          class="tc-section"
          v-for="section in sections"
          :key="section.key"
      >
        <h3>{{ $t(`terms-and-conditions.${section.key}.title`) }}</h3>
        <p v-html="formatContent($t(`terms-and-conditions.${section.key}.content`))"></p>
      </div>
      <button class="tc-close-btn" @click="close">OK</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TermsAndConditionsModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    close() {
      this.$emit('close')
    },
    formatContent(content) {
      // Reemplaza saltos de línea por <br>
      return content.replace(/\n/g, '<br>')
    },
  },
  data() {
    return {
      sections: [
        { key: 'introduction' },
        { key: 'use-of-the-service' },
        { key: 'user-responsibility' },
        { key: 'responsibility-of-the-development-team' },
        { key: 'privacy-and-data-protection' },
        { key: 'intellectual-property' },
        { key: 'ethical-and-professional-principles' },
        { key: 'modifications-and-contact' },
      ],
    }
  },
}
</script>

<style scoped>
.tc-modal-backdrop {
  position: fixed;
  z-index: 3000;
  inset: 0;
  background: rgba(32,40,48,0.60);
  display: flex;
  align-items: center;
  justify-content: center;
}
.tc-modal-content {
  background: #fff;
  color: #1c2331;
  border-radius: 14px;
  padding: 2.2rem 2rem 1.3rem 2rem;
  min-width: 330px;
  max-width: 420px;
  box-shadow: 0 2px 24px 0 #21223a2b;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
}
.tc-modal-content h2 {
  font-size: 1.35em;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.2em;
  color: #214da1;
}
.tc-modal-content h3 {
  margin-top: 1.2em;
  font-size: 1.04em;
  font-weight: 600;
  color: #1744a3;
}
.tc-modal-content p {
  margin: 0.5em 0 0 0;
  font-size: 0.98em;
  color: #202333;
  white-space: pre-line;
}
.tc-close-btn {
  margin-top: 2em;
  display: block;
  margin-left: auto;
  margin-right: auto;
  padding: 0.6em 2em;
  background: #214da1;
  color: #fff;
  border: none;
  border-radius: 9px;
  font-size: 1em;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}
.tc-close-btn:hover {
  background: #153165;
}
</style>
