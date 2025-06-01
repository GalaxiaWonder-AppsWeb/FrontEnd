<template>
  <div class="toolbar-container">
    <!-- Parte superior fija -->
    <pv-toolbar class="toolbar-top">
      <template #start>
        <h1 class="section-title">{{ $t(sectionTitle+'.title') }}</h1>
      </template>
      <template #end>
        <pv-button icon="pi pi-bell" text rounded severity="warning" />
        <pv-button icon="pi pi-user" text rounded severity="info" />
        <LanguageSwitcher />
      </template>
    </pv-toolbar>

    <!-- Parte inferior: navegación dinámica -->
    <nav class="toolbar-nav">
      <template v-if="inOrganizationView">
        <pv-button text plain :label="$t(sectionTitle + '.section.information')" @click="goTo('information')" />
        <pv-button text plain :label="$t(sectionTitle + '.section.projects')" @click="goTo('projects')" />
        <pv-button text plain :label="$t(sectionTitle + '.section.members')" @click="goTo('members')" />
        <pv-button text plain :label="$t(sectionTitle + '.section.configurations')" @click="goTo('settings')" />
      </template>

      <template v-else-if="inProjectView">
        <pv-button text plain label="Information" @click="goTo('information')" />
        <pv-button text plain label="Schedule" @click="goTo('schedule')" />
        <pv-button text plain label="Change Management" @click="goTo('change-management')" />
      </template>
    </nav>
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router'
import LanguageSwitcher from './language-switcher.component.vue'

export default {
  name: 'ToolbarComponent',
  components: {
    LanguageSwitcher
  },
  data() {
    return {
      route: useRoute(),
      router: useRouter()
    }
  },
  computed: {
    inOrganizationView() {
      return this.route.path.startsWith('/organizations/') && !this.route.path.includes('/projects/');
    },
    inProjectView() {
      return this.route.path.includes('/projects/') || 
             (this.route.name === 'organization-specific-project' && this.route.params.projectId)
    },
    sectionTitle() {
      if (this.inProjectView) return 'project'
      if (this.inOrganizationView) return 'organization'
      return 'organization'
    }
  },
  methods: {
    goTo(section) {
      const { orgId, projectId } = this.route.params
      let path = ''
      if (this.inProjectView && projectId) {
        path = `/organizations/${orgId}/projects/${projectId}`
        if (section !== 'projects') {
          path += `/${section}`
        }
      } else if (this.inOrganizationView && orgId) {
        path = `/organizations/${orgId}/${section}`
      }
      this.router.push(path)
    }
  }
}
</script>

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
  justify-content: start;
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
