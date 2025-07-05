<template>
  <div class="client-projects">
    <h3 class="projects-title">{{ $t('client.projects.title') }}</h3>
    <div v-if="loading" class="text-center py-8">
      <pv-progress-spinner style="width: 40px; height: 40px;" />
      <div class="mt-2">{{ $t('client.projects.loading') }}</div>
    </div>
    <div v-else-if="projects.length === 0" class="text-gray-500 text-center py-8">
      {{ $t('client.projects.no_projects') }}
    </div>
    <div v-else class="projects-list">
      <div
          v-for="project in projects"
          :key="project.id"
          class="project-card"
      >
        <div class="project-title">{{ project.name }}</div>
        <div class="project-description">{{ project.description }}</div>
        <div class="project-info">
          <span>{{ $t('client.projects.card.budget') }}: <b>S/ {{ project.budget }}</b></span>
          <span>{{ $t('client.projects.card.start_date') }}: <b>{{ formatDate(project.startDate) }}</b></span>
          <span>{{ $t('client.projects.card.end_date') }}: <b>{{ formatDate(project.endDate) }}</b></span>
        </div>
        <pv-button
            :label="$t('client.projects.card.view_details')"
            icon="pi pi-eye"
            class="mt-4"
            @click="goToProject(project.id)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { projectService } from '../../projects/services/project.service.js'

export default {
  name: 'ClientProjects',
  data() {
    return {
      loading: false,
      projects: []
    }
  },
  async created() {
    this.loading = true;
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const res = await projectService.getByContractingEntity({ id: user.personId })
      this.projects = Array.isArray(res) ? res : []
    } catch (e) {
      this.projects = []
    } finally {
      this.loading = false
    }
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-PE')
    },
    goToProject(projectId) {
      // Esto debe coincidir con tu ruta definida para la información del proyecto de cliente
      this.$router.push({ name: 'client-project-information', params: { projectId } })
    }
  }
}
</script>

<style scoped>
.client-projects {

}
.projects-title {
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: #1e3a8a;
  text-align: center;
}
.projects-list {

}
.project-card {
  min-width: 320px;
  min-height: 120px;
  max-width: 420px;
  color: #22223b;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(30,58,138,0.12);
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1rem;
}
.project-title {
  font-weight: 700;
  font-size: 1.15rem;
  margin-bottom: 0.8rem;
}
.project-description {
  font-size: 1rem;
  margin-bottom: 1rem;
  text-align: center;
}
.project-info {
  width: 100%;
  font-size: 0.97rem;
  margin-top: 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

}
</style>
