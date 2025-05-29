<script>
import LanguageSwitcher from "./language-switcher.component.vue";
import {useRoute, useRouter} from "vue-router";

export default {
  name: "toolbar-client",
  components: {LanguageSwitcher},
  data() {
    return {
      route: useRoute(),
      router: useRouter()
    }
  }
}
</script>

<template>
  <div class="toolbar-container">
    <pv-toolbar class="toolbar-top">
      <template #start>
        <h1 class="section-title">{{ $t('navigation.client-area') }}</h1>
      </template>
      <template #end>
        <pv-button icon="pi pi-bell" text rounded severity="warning" />
        <pv-button icon="pi pi-user" text rounded severity="info" />
        <LanguageSwitcher />
      </template>
    </pv-toolbar>
  </div>
</template>

<style scoped>
.toolbar-container {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: white;
  color: black;
}

.toolbar-top {
  background-color: #1e3a8a;
  color: white;
  border-radius: 0;
  padding: 0.75rem 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;

}
</style>