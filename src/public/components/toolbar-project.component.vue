<script>
import LanguageSwitcher from "./language-switcher.component.vue";
import {useRoute, useRouter} from "vue-router";

export default {
  name: "toolbar-project",
  components: {LanguageSwitcher},
  data() {
    return {
      route: useRoute(),
      router: useRouter()
    }
  },
  methods: {
    goTo(section) {
      const { orgId, projectId } = this.route.params
      let path = ''
      path = `/organizations/${orgId}/project/${projectId}/${section}`
      this.router.push(path)
    }
  }
}
</script>

<template>
  <div class="toolbar-container">
    <pv-toolbar class="toolbar-top">
      <template #start>
        <h1 class="section-title">{{ $t('navigation.project.title') }}</h1>
      </template>
      <template #end>
        <pv-button icon="pi pi-bell" text rounded severity="warning" />
        <pv-button icon="pi pi-user" text rounded severity="info" />
        <LanguageSwitcher />
      </template>
    </pv-toolbar>

    <nav class="toolbar-nav">
      <pv-button text plain :label="$t('navigation.project.information')" @click="goTo('information')" />
      <pv-button text plain :label="$t('navigation.project.schedule')" @click="goTo('schedule')" />
      <pv-button text plain :label="$t('navigation.project.change-management')" @click="goTo('change-management')" />
    </nav>
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

.toolbar-nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #ddd;
}

::v-deep(.p-button-label){
  color: black;
}

::v-deep(.p-button-label:hover){
  text-decoration: underline;
  background: white;
}

.toolbar-nav .p-button.p-button-text:hover {
  background-color: transparent !important;
  color: white !important;
}

</style>