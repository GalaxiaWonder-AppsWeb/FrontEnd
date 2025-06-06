<script>
import { useRoute } from 'vue-router';
import CreateProject from '../../projects/components/create-project.component.vue';

export default {
  name: "OrganizationProjects",
  components: {
    CreateProject
  },
  data() {
    return {
      route: useRoute(),
      loading: false,
      projects: [],
      currentUser: null,
      userRole: null,
      organizationId: null,
      error: null,
      selectedProject: null
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
  methods: {
    async loadProjects() {
      this.loading = true;
      this.error = null;
      
      try {
        // Llamada a la API para cargar los proyectos de la organización
        const response = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000'}/projects/organization/${this.organizationId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
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
        const response = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000'}/projects/${projectId}`, {
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
        case 'basic studies':
        case 'estudios básicos':
          return 'info';
        case 'design in progress':
        case 'diseño en progreso':
          return 'warning';
        case 'under review':
        case 'en revisión':
          return 'warning';
        case 'change requested':
        case 'cambio solicitado':
          return 'danger';
        case 'change pending':
        case 'cambio pendiente':
          return 'danger';
        case 'rejected':
        case 'rechazado':
          return 'danger';
        case 'approved':
        case 'aprobado':
          return 'success';
        default:
          return 'secondary';
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
    
    handleProjectCreated() {
      // Recargar los proyectos después de crear uno nuevo
      this.loadProjects();
    }
  },
  created() {
    this.getUserInfo();
    this.organizationId = this.route.params.orgId;
    this.loadProjects();
  }
}
</script>

<template>
  <div class="projects-container">
    <div class="header">
      <h2>{{ $t('projects.title') }}</h2>
      
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
          <span class="start-date" v-if="project.startingDate">
            <i class="pi pi-calendar"></i> {{ new Date(project.startingDate).toLocaleDateString() }}
          </span>
          <pv-button 
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
</style>