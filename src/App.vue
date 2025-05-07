<script>
import {defineComponent} from "vue";
import LanguageSwitcher from "./public/components/language-switcher.component.vue";
import RegisterComponent from "./iam/components/register-form.component.vue"

export default defineComponent({
  components: {LanguageSwitcher, RegisterComponent},
})
</script>

<template>
  <RegisterComponent/>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
