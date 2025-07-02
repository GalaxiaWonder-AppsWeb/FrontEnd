<script>
import { useRoute } from 'vue-router';
import CreateProject from '../../projects/components/create-project.component.vue';
import {projectService} from "../../projects/services/project.service.js";
import { organizationService } from "../../organizations/services/organization.service.js";

export default {
  name: "OrganizationProjects",
  components: {
    CreateProject
  },
  created() {
    const route = useRoute();
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.userRole = this.currentUser.activeOrganizationRole; // Nuevo
    }

    this.organizationId = route.params.orgId;

    if (this.organizationId && this.currentUser && this.currentUser.personId) {
      this.loadProjects();
    }
  },
  data() {
    return {
      route: useRoute(),
      loading: false,
      projects: [],
      projectsWhereUserIsTeamMember: [],  // Proyectos donde el usuario es miembro del equipo
      currentUser: null,
      userRole: null,
      organizationId: null,
      error: null,
      selectedProject: null,
      loadingMemberships: false
    };
  },
  computed: {
    canCreateProject() {
      // Considera que currentUser se setea correctamente en mounted o created
      return this.currentUser && this.currentUser.activeOrganizationRole === 'Contractor';
    },
    filteredProjects() {
      // Si tienes algún filtro para mostrar proyectos
      return this.projects;
    }
  },
  methods: {
    async loadProjects() {
      this.loading = true;
      try {
        // Llama al servicio y guarda la respuesta en una variable temporal
        const response = await organizationService.getByPersonAndOrganizationId({
          organizationId: parseInt(this.organizationId),
          personId: this.currentUser.personId
        });



        // Si tu backend retorna un array directamente, usa esto:
        this.projects = response;

        // Si tu backend retorna { data: [...] }
        // this.projects = response.data;

      } catch (e) {
        this.error = e.message || 'Error al cargar proyectos';
      } finally {
        this.loading = false;
      }
    },
    // Este método se ejecuta al crearse un nuevo proyecto
    async handleProjectCreated(newProjectId) {
      // Puedes recargar toda la lista, o solo agregar el nuevo proyecto si tienes el detalle
      await this.loadProjects();
      this.$toast.add({
        severity: 'success',
        summary: 'Proyecto creado',
        detail: 'El proyecto ha sido creado exitosamente.',
        life: 3000
      });
    }
  }
}
</script>

<template>
  <div class="projects-container">
    <div class="header">
      <h2 class="title">{{ $t('projects.title') }}</h2>
      
      <CreateProject
        v-if="canCreateProject"
        :organizationId="organizationId"
        @project-created="handleProjectCreated"
      />
    </div>

    
    <div v-if="loading" class="loading-indicator">
      <pv-progress-spinner />
      <span>{{ $t('projects.loading') }}</span>
    </div>
    
    <div v-else-if="error" class="error-message">
      <i class="pi pi-exclamation-triangle" style=" font-size: 2rem; color: var(--red-500);"></i>
      <p>{{ error }}</p>
    </div>
      <!-- Debug information for roles and members -->
    <div class="debug-info mb-4" v-if="userRole === 'Worker'">
      <details>
        <summary class="text-sm">Información de acceso</summary>
        <div class="p-2 bg-blue-900 rounded text-xs">
          <p>Rol en organización: <strong>{{ userRole }}</strong></p>
          <p>ID de miembro: <strong>{{ currentUser?.memberId }}</strong></p>
          <p>Proyectos donde es miembro: <strong>{{ projectsWhereUserIsTeamMember.length }}</strong></p>
          <p>Total proyectos en organización: <strong>{{ projects.length }}</strong></p>
          <p>Proyectos filtrados para mostrar: <strong>{{ filteredProjects.length }}</strong></p>
        </div>
      </details>
    </div>
    
    <!-- Mensaje para recargar membresías si eres worker -->
    <div v-if="userRole === 'Worker'" class="mb-4">
      <pv-button 
        icon="pi pi-refresh" 
        label="Actualizar mis proyectos" 
        class="p-button-sm p-button-outlined" 
        @click="loadProjectMemberships"
        :loading="loadingMemberships"
      />
      <small class="ml-2 text-blue-300">Si no ves todos tus proyectos, haz clic para actualizar</small>
    </div>
    
    <div v-if="filteredProjects.length === 0" class="empty-state">
      <p>{{ userRole === 'Worker' ? $t('projects.empty_member') : $t('projects.empty') }}</p>
      <p v-if="canCreateProject" class="create-prompt">{{ $t('projects.create_prompt') }}</p>
      
      <!-- Mostrar mensaje específico para Workers -->
      <div v-if="userRole === 'Worker'" class="mt-4 p-3 bg-blue-900 rounded">
        <p class="font-semibold">¿No ves tus proyectos?</p>
        <p class="text-sm mb-2">Puede que aún no hayas sido añadido como miembro a ningún proyecto de esta organización.</p>
        <pv-button 
          label="Contacta al administrador" 
          icon="pi pi-envelope" 
          class="p-button-sm" 
          @click="$toast.add({severity:'info', summary:'Información', detail:'Ponte en contacto con el administrador de la organización para ser añadido a proyectos.', life: 3000})"
        />
      </div>
    </div>
    
    <div v-else class="projects-grid">
      <div v-for="project in filteredProjects" :key="project.id" class="project-card">
        <div class="project-header">
          <h3>{{ project.projectName }}</h3>
          <div>
            <pv-tag v-if="project.status" :value="project.status" class="mr-2" />
            <!-- Mostrar tag del rol en el proyecto si eres Worker -->
            <pv-tag v-if="userRole === 'Worker'" severity="info" />
          </div>
        </div>
        
        <p class="project-description">{{ project.description || 'Sin descripción' }}</p>
        
        <div class="project-footer">
          <span class="start-date" v-if="project.startDate">
            <i class="pi pi-calendar"></i> {{ new Date(project.startDate).toLocaleDateString() }}
          </span>
          <pv-button 
            icon="pi pi-eye" 
            :label="$t('projects.view_details')" 
            text 
            @click="$router.push(`/organizations/${organizationId}/projects/${project.id}`)" />
        </div>
      </div>
    </div>
    -->
  </div>
</template>

<style scoped>
.projects-container {
  padding: 1rem;
}
.title {
  color: #171414;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  margin: 3rem 0;
  color: #666;
}

.create-prompt {
  margin-top: 1rem;
  font-style: italic;
  color: #999;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 3rem 0;
  color: var(--red-700);
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 3rem 0;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.project-card {
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 1.5rem;
  background-color: #1a365d;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  color: #ffffff;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.25);
  background-color: #2c4a7c;
  border-color: #60a5fa;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.project-header h3 {
  color: #ffffff;
  font-weight: 600;
  margin: 0;
  font-size: 1.25rem;
}

.project-description {
  flex-grow: 1;
  margin-bottom: 1rem;
  color: #e2e8f0;
  line-height: 1.5;
  font-size: 0.95rem;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid rgba(255,255,255,0.15);
  padding-top: 0.75rem;
}

.start-date {
  font-size: 0.85rem;
  color: #505050;
  display: flex;
  align-items: center;
  font-weight: 500;
  gap: 0.25rem;
}

.debug-info {
  background-color: rgba(30, 41, 59, 0.5);
  border-radius: 8px;
  padding: 0.5rem;
  color: #cbd5e1;
}

.debug-info summary {
  cursor: pointer;
  user-select: none;
  padding: 0.25rem 0.5rem;
  font-weight: 500;
}

.debug-info details[open] summary {
  margin-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 0.5rem;
}

.debug-info p {
  margin: 0.25rem 0;
  font-size: 0.8rem;
}

.debug-info strong {
  color: #60a5fa;
  font-weight: 600;
}
</style>