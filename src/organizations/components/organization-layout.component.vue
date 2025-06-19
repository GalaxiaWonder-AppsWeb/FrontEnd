<template>
  <div class="organization-layout">
    <ToolbarComponent />

    <main class="organization-main">
      <router-view />
    </main>
  </div>
</template>

<script>
import ToolbarComponent from '../../public/components/toolbar-content.component.vue'
import { useRoute } from 'vue-router';

export default {
  name: 'OrganizationLayout',  data(){
    return {
      route: useRoute(),
      personId: null,
      organizationId: null,
      invitedPersonIds: [],
    }
  },
  components: {
    ToolbarComponent
  },  methods: {
  },
  created() {
  }
}
</script>

<style scoped>
.organization-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

.organization-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>