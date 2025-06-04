<script>
import { useRoute } from 'vue-router';

export default {
  name: "OrganizationProjects",
  data() {
    return {
      route: useRoute(),
      loading: false,
      projects: [],
      currentUser: null,
      userRole: null,
      organizationId: null,
      error: null
    };
  },
  computed: {
    // Filtra los proyectos según el rol del usuario
    filteredProjects() {
      if (!this.projects || this.projects.length === 0) {
        return [];
      }
      
      // Si es Contractor (creador), muestra todos los proyectos
      if (this.userRole === 'Contractor') {
        return this.projects;
      }
      
      // Si es Worker (miembro), muestra solo los proyectos en los que participa
      if (this.userRole === 'Worker') {
        return this.projects.filter(project => 
          project.team && project.team.some(member => 
            member.memberId === this.currentUser.memberId
          )
        );
      }
      
      return [];
    },
    
    // Determina si el usuario puede crear nuevos proyectos
    canCreateProject() {
      return this.userRole === 'Contractor';
    }
  },
  methods: {    async loadProjects() {
      this.loading = true;
      this.error = null;
        try {
        // Llamada a la API para cargar los proyectos de la organización
        const response = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/organizations/${this.organizationId}/projects`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Agregar token de autorización si es necesario
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error al cargar proyectos: ${response.statusText}`);
        }
        
        this.projects = await response.json();
        
        // Si hay un projectId específico en los parámetros, cargar ese proyecto
        if (this.route.params.projectId) {
          await this.loadSpecificProject(this.route.params.projectId);
        }
      } catch (error) {
        console.error('Error cargando proyectos:', error);
        this.error = `No se pudieron cargar los proyectos: ${error.message}`;
        this.projects = [];
      } finally {
        this.loading = false;
      }
    },
      async loadSpecificProject(projectId) {
      try {
        const response = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/projects/${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error al cargar proyecto: ${response.statusText}`);
        }
        
        const project = await response.json();
        
        // Verificar si el usuario tiene acceso a este proyecto
        if (this.userRole === 'Worker') {
          // Si es un trabajador, verificar si es miembro del equipo
          const isMember = project.team && 
                         project.team.some(member => member.memberId === this.currentUser.memberId);
          
          if (!isMember) {
            this.$toast.add({
              severity: 'warn',
              summary: 'Acceso denegado',
              detail: 'No tienes permiso para ver este proyecto',
              life: 3000
            });
            
            // Redirigir a la lista de proyectos
            this.$router.replace(`/organizations/${this.organizationId}/projects`);
            return;
          }
        }
        
        this.selectedProject = project;
      } catch (error) {
        console.error('Error cargando proyecto específico:', error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo cargar el proyecto: ${error.message}`,
          life: 3000
        });
      }
    },
    
    getStatusSeverity(status) {
      // Asigna un color basado en el estado del proyecto
      switch (status?.toLowerCase()) {
        case 'active':
        case 'activo':
          return 'success';
        case 'completed':
        case 'completado':
          return 'info';
        case 'on hold':
        case 'en espera':
          return 'warning';
        case 'cancelled':
        case 'cancelado':
          return 'danger';
        case 'planning':
        case 'planificación':
          return 'secondary';
        default:
          return null;
      }
    },
    
    getUserInfo() {
      try {
        // Obtener información del usuario desde localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          this.currentUser = JSON.parse(userData);
          this.userRole = this.currentUser.activeOrganizationRole;
        }
      } catch (error) {
        console.error('Error al obtener información del usuario:', error);
      }
    },
    
    createNewProject() {
      // Verificar permisos antes de permitir crear
      if (!this.canCreateProject) {
        this.$toast.add({
          severity: 'error',
          summary: 'Permiso denegado',
          detail: 'Solo el contratista puede crear nuevos proyectos',
          life: 3000
        });
        return;
      }
      
      // Aquí iría la navegación a la página de creación de proyecto
      // o la apertura de un modal para crear proyecto
      this.$toast.add({
        severity: 'info',
        summary: 'Crear proyecto',
        detail: 'Funcionalidad de creación de proyecto en desarrollo',
        life: 3000
      });
    }
  },
  created() {
    this.getUserInfo();
    this.organizationId = this.route.params.orgId;
    this.loadProjects();
  }
}
</script>

<template>  <div class="projects-container">
    <div class="header">
      <h2>{{ $t('projects.title') }}</h2>      <pv-button v-if="canCreateProject" 
                icon="pi pi-plus" 
                :label="$t('projects.create')"
                class="create-button"
                @click="createNewProject" />
    </div>
    
    <div v-if="loading" class="loading-indicator">
      <pv-progress-spinner />
      <span>{{ $t('projects.loading') }}</span>
    </div>
    
    <div v-else-if="error" class="error-message">
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--red-500);"></i>
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="filteredProjects.length === 0" class="empty-state">
      <p>{{ userRole === 'Worker' ? $t('projects.empty_member') : $t('projects.empty') }}</p>
      <p v-if="canCreateProject" class="create-prompt">{{ $t('projects.create_prompt') }}</p>
    </div>
    
    <div v-else class="projects-grid">
      <div v-for="project in filteredProjects" :key="project.id" class="project-card">
        <div class="project-header">
          <h3>{{ project.name }}</h3>
          <pv-tag v-if="project.status" :severity="getStatusSeverity(project.status)" :value="project.status" />
        </div>
        <p class="project-description">{{ project.description || 'Sin descripción' }}</p>
        <div class="project-footer">
          <span class="start-date" v-if="project.startDate">
            <i class="pi pi-calendar"></i> {{ new Date(project.startDate).toLocaleDateString() }}
          </span>          <pv-button 
            icon="pi pi-eye" 
            :label="$t('projects.view_details')" 
            text 
            @click="$router.push(`/organizations/${organizationId}/projects/${project.id}`)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-container {
  padding: 1rem;
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
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.project-description {
  flex-grow: 1;
  margin-bottom: 1rem;
  color: #555;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.start-date {
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>