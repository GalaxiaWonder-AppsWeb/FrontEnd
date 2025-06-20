<script>
import { useRoute } from 'vue-router';
import CreateProject from '../../projects/components/create-project.component.vue';

export default {
  name: "OrganizationProjects",
  components: {
    CreateProject
  }, data() {
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
  computed: {    // Filtra los proyectos según el rol del usuario
    filteredProjects() {
      if (!this.projects || this.projects.length === 0) {
        return [];
      }

      // Si es Contractor (creador), muestra todos los proyectos
      if (this.userRole === 'Contractor') {
        return this.projects;
      }

      // Si es Worker (miembro), muestra solo los proyectos en los que participa oficialmente
      // como miembro del equipo en la colección project-team-members
      if (this.userRole === 'Worker') {
        // Projects where the user is a team member (via project-team-members collection)
        return this.projectsWhereUserIsTeamMember || [];
      }

      return [];
    },
    // Determina si el usuario puede crear nuevos proyectos
    canCreateProject() {
      // Verificar explícitamente el rol contra 'Contractor' para crear proyectos
      const user = JSON.parse(localStorage.getItem('user'));
      return user.activeOrganizationRole === 'Contractor';
    }
  },
  methods: {

    async loadProjectMemberships() {/*
      if (!this.currentUser || !this.currentUser.memberId) {
        console.warn('No se puede cargar membresías de proyectos sin ID de miembro');
        return;
      }

      this.loadingMemberships = true;

      try {
        // Obtener el ID del miembro de la organización actual
        const organizationMemberId = this.currentUser.memberId;
        // Consultar project-team-members donde el usuario actual es miembro
        const apiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';

        // Primero intentamos la búsqueda exacta usando el parámetro organizationMemberId
        const response = await fetch(`${apiUrl}/project-team-members?organizationMemberId=${organizationMemberId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error al cargar membresías: ${response.statusText}`);
        }

        const memberships = await response.json();
        // Si hay membresías, cargar los proyectos correspondientes
        if (memberships && memberships.length > 0) {
          const projectIds = memberships.map(m => m.projectId);
          // Si los proyectos aún no están cargados o hay IDs no encontrados, cargarlos directamente
          if (!this.projects.length || !projectIds.every(id => this.projects.some(p => p.id === id))) {
            const projectPromises = projectIds.map(async projectId => {
              try {
                const projectResponse = await fetch(`${apiUrl}/projects/${projectId}`);
                if (projectResponse.ok) {
                  return await projectResponse.json();
                } else {
                  console.warn(`No se pudo cargar el proyecto ${projectId}: ${projectResponse.statusText}`);
                  return null;
                }
              } catch (projectError) {
                console.error(`Error cargando proyecto ${projectId}:`, projectError);
                return null;
              }
            });

            const projectsLoaded = (await Promise.all(projectPromises)).filter(Boolean);
            // Asegurarse de que los proyectos pertenecen a la organización actual
            const orgProjects = projectsLoaded.filter(p =>
                p.organizationId === Number(this.organizationId)
            );

            // Combinar con la lista existente sin duplicados
            const existingIds = this.projectsWhereUserIsTeamMember.map(p => p.id);
            const newProjects = orgProjects.filter(p => !existingIds.includes(p.id));

            this.projectsWhereUserIsTeamMember = [...this.projectsWhereUserIsTeamMember, ...newProjects];
          } else {
            // Filtrar los proyectos ya cargados en memoria
            const memberProjects = this.projects.filter(p => projectIds.includes(p.id));
            this.projectsWhereUserIsTeamMember = memberProjects;
          }
        } else {
          this.projectsWhereUserIsTeamMember = [];
        }
      } catch (error) {
        console.error('Error cargando membresías de proyectos:', error);
        // Intentar búsqueda alternativa para encontrar membresías
        await this.loadProjectMembershipsFallback();
      } finally {
        this.loadingMemberships = false;
      }
    */},

    // Método de respaldo para buscar las membresías si el método principal falla
    async loadProjectMembershipsFallback() {/*
      try {
        // Obtener todos los project-team-members y filtrar manualmente
        const apiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/project-team-members`);

        if (!response.ok) {
          throw new Error("No se pudieron cargar los miembros de proyectos");
        }

        const allMemberships = await response.json();
        // Filtrar manualmente por el ID del miembro de la organización
        const organizationMemberId = this.currentUser.memberId;
        const userMemberships = allMemberships.filter(m =>
            m.organizationMemberId === organizationMemberId ||
            m.memberId === organizationMemberId
        );

        // Obtener los IDs de proyectos
        if (userMemberships.length > 0) {
          const projectIds = [...new Set(userMemberships.map(m => m.projectId))]; // Eliminar duplicados

          // Cargar cada proyecto individualmente
          const loadedProjects = [];

          for (const projectId of projectIds) {
            try {
              const projectResponse = await fetch(`${apiUrl}/projects/${projectId}`);
              if (projectResponse.ok) {
                const project = await projectResponse.json();
                // Verificar que pertenece a la organización actual
                if (project.organizationId === Number(this.organizationId)) {
                  loadedProjects.push(project);
                }
              }
            } catch (projectError) {
              console.error(`Error cargando proyecto ${projectId}:`, projectError);
            }
          }

          this.projectsWhereUserIsTeamMember = loadedProjects;
        }
      } catch (error) {
        console.error('Error en método fallback:', error);
      }
    */},
    async loadProjects() {/*
      this.loading = true;
      this.error = null;
      
      try {
        // Verificar si tenemos la membresía almacenada
        if (!this.currentUser || !this.currentUser.memberId) {
          console.warn("No hay información de usuario o memberId disponible");
          
          // Intentar inicializar los datos del usuario de forma completa
          await this.initializeUserData();
          
          // Si después de inicializar aún no tenemos memberId
          if (!this.currentUser || !this.currentUser.memberId) {
            console.warn("No se pudo obtener el memberId después de la inicialización. Intentando una última recuperación...");
            
            // Últimos intentos para tener información del usuario
            if (this.currentUser && this.currentUser.id && this.organizationId) {
              await this.loadUserMembership();
            } else {
              console.error("No hay suficiente información para cargar el memberId. ID Usuario:", 
                this.currentUser?.id, "ID Organización:", this.organizationId);
            }
          }
        }
        
        // Llamada a la API para cargar los proyectos de la organización
        const apiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/projects?organizationId=${this.organizationId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error al cargar proyectos: ${response.statusText}`);
        }
        
        this.projects = await response.json();
        // Cargar membresías de proyectos para todos los usuarios
        // Para Contractor verá todos, pero para Worker solo verá en los que es miembro
        if (this.userRole === 'Worker') {
          await this.loadProjectMemberships();
        } else {
          }
        
        // Si hay un projectId específico en los parámetros, cargar ese proyecto
        if (this.route.params.projectId) {
          await this.loadSpecificProject(this.route.params.projectId);
        }
      } catch (error) {
        console.error('Error cargando proyectos:', error);
        this.error = `No se pudieron cargar los proyectos: ${error.message}`;
        this.projects = [];
        
        // Si el error es con la organización, intentar cargar solo los proyectos donde el usuario es miembro
        if (this.userRole === 'Worker') {
          try {
            await this.loadProjectMemberships();
          } catch (membershipError) {
            console.error("Error cargando membresías como fallback:", membershipError);
          }
        }
      } finally {
        this.loading = false;
      }
      */
    },
    async loadSpecificProject(projectId) {/*
      try {
        const apiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/projects/${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error al cargar proyecto: ${response.statusText}`);
        }
        
        const project = await response.json();
        // Verificar si el usuario tiene acceso a este proyecto
        if (this.userRole === 'Worker') {
          // Consultar si el usuario es miembro del equipo del proyecto en project-team-members
          try {
            // Primer intento: búsqueda directa con query params
            const membershipUrl = `${apiUrl}/project-team-members?projectId=${projectId}&organizationMemberId=${this.currentUser.memberId}`;
            const membershipResponse = await fetch(membershipUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
              }
            });
            
            if (!membershipResponse.ok) {
              throw new Error(`Error verificando membresía: ${membershipResponse.statusText}`);
            }
            
            let memberships = await membershipResponse.json();
            // Si no encontramos membresía directamente, hacer búsqueda manual como fallback
            if (!memberships || !Array.isArray(memberships) || memberships.length === 0) {
              // Obtener todos los project-team-members
              const allMembershipsResponse = await fetch(`${apiUrl}/project-team-members`);
              if (allMembershipsResponse.ok) {
                const allMemberships = await allMembershipsResponse.json();
                
                // Filtrar manualmente
                memberships = allMemberships.filter(m => 
                  (m.projectId === Number(projectId) || m.projectId === projectId) && 
                  (m.organizationMemberId === Number(this.currentUser.memberId) || 
                   m.organizationMemberId === this.currentUser.memberId ||
                   m.memberId === Number(this.currentUser.memberId) ||
                   m.memberId === this.currentUser.memberId)
                );
                
                }
            }
            
            const isMember = memberships && memberships.length > 0;
            
            if (!isMember) {
              this.$toast.add({
                severity: 'warn',
                summary: 'Acceso denegado',
                detail: 'No tienes permiso para ver este proyecto. Solo los miembros del equipo pueden acceder.',
                life: 3000
              });
              
              // Redirigir a la lista de proyectos
              this.$router.replace(`/organizations/${this.organizationId}/projects`);
              return;
            } else {
              // Guardar el rol del usuario en este proyecto para validaciones de acceso
              const projectMembership = memberships[0];
              if (projectMembership && projectMembership.role) {
                this.currentUser.activeProjectRole = projectMembership.role;
                localStorage.setItem('user', JSON.stringify(this.currentUser));
              }
              
              // Añadir el proyecto a la lista de proyectos donde el usuario es miembro
              if (!this.projectsWhereUserIsTeamMember.some(p => p.id === project.id)) {
                this.projectsWhereUserIsTeamMember.push(project);
                }
            }
          } catch (error) {
            console.error('Error verificando acceso al proyecto:', error);
            this.$toast.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo verificar tu acceso al proyecto',
              life: 3000
            });
            
            // Por seguridad, redirigir a la lista de proyectos
            this.$router.replace(`/organizations/${this.organizationId}/projects`);
            return;
          }
        } else {
          // El usuario es Contractor, por lo que automáticamente le asignamos el rol de Coordinator en el proyecto
          this.currentUser.activeProjectRole = 'Coordinator';
          localStorage.setItem('user', JSON.stringify(this.currentUser));
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
      */
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

          // Si el objeto currentUser está incompleto, inicializarlo correctamente
          if (!this.currentUser) {
            this.currentUser = {};
          }
          // Si el rol no está definido, determinar cuál debería ser
          if (!this.currentUser.activeOrganizationRole) {
            // No asignar automáticamente el rol, eso lo hará el router guard
            // Solo definir un rol temporal mientras se carga la página
            this.currentUser.activeOrganizationRole = 'Worker'; // Rol más restrictivo por defecto
            // No guardamos en localStorage aquí, para no sobreescribir lo que el router determine
            // Solo actualizamos la visualización local
          }

          this.userRole = this.currentUser.activeOrganizationRole;
          // Asegurarnos de que tengamos un memberId
          if (!this.currentUser.memberId && this.organizationId) {
            // Aquí no hacemos await porque esta función no es async, se manejará en initializeUserData()
            this.loadUserMembership();
          }
        } else {
          console.warn("No se encontró información de usuario en localStorage");
          // Inicializar con valores por defecto para evitar errores
          this.currentUser = {
            activeOrganizationRole: 'Worker',
            id: null // Asegurarse de tener un campo id (necesario para loadUserMembership)
          };
          this.userRole = 'Worker';

          // Guardar en localStorage para futuras referencias
          localStorage.setItem('user', JSON.stringify(this.currentUser));
        }
      } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        // Inicializar con valores por defecto en caso de error
        this.currentUser = {activeOrganizationRole: 'Worker'};
        this.userRole = 'Worker';
      }
    },      // Método para cargar la membresía del usuario desde la API
    async loadUserMembership() {/*
      try {
        if (!this.currentUser || !this.currentUser.id || !this.organizationId) {
          console.warn("No se puede cargar la membresía sin ID de usuario u organización");
          return null;
        }

        const apiUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';

        // Buscar por userId y organizationId
        const response = await fetch(`${apiUrl}/members?userId=${this.currentUser.id}&organizationId=${this.organizationId}`);

        if (!response.ok) {
          throw new Error(`Error al cargar membresía: ${response.statusText}`);
        }

        const memberships = await response.json();
        if (memberships && memberships.length > 0) {
          const membership = memberships[0]; // Tomar la primera membresía
          // Actualizar la información del usuario
          this.currentUser.memberId = membership.id;
          this.currentUser.memberType = membership.type || 'Worker';

          // Solo actualizamos el rol si no existe o si es 'Worker'
          // NUNCA sobreescribir 'Contractor' con 'Worker'
          if (!this.currentUser.activeOrganizationRole ||
              this.currentUser.activeOrganizationRole !== 'Contractor') {
            this.currentUser.activeOrganizationRole = membership.type || 'Worker';
          } else {
          }

          // Actualizar el rol local
          this.userRole = this.currentUser.activeOrganizationRole;

          // Guardar la información actualizada en localStorage
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          // Si hay un personId en la membresía, también lo guardamos
          if (membership.personId) {
            this.currentUser.personId = membership.personId;
            localStorage.setItem('user', JSON.stringify(this.currentUser));
          }

          return this.currentUser;
        } else {
          console.warn(`No se encontró membresía para usuario ${this.currentUser.id} en organización ${this.organizationId}`);
          return null;
        }
      } catch (error) {
        console.error('Error al cargar membresía:', error);
      }
      */},

    handleProjectCreated() {/*
      // Recargar los proyectos después de crear uno nuevo
      this.loadProjects();
      */
    },

    getProjectRole(project) {

      // Si el usuario es Contractor (creador), siempre es Coordinator en el proyecto
      if (this.userRole === 'Contractor') {
        return 'Coordinator';
      }

      // Para Workers, buscar en las membresías para determinar el rol
      try {
        // Buscar el proyecto en projectsWhereUserIsTeamMember para ver si el usuario ya es miembro
        const isMember = this.projectsWhereUserIsTeamMember.some(p => p.id === project.id);

        if (isMember) {
          // Si hay un rol específico guardado para este proyecto, mostrarlo
          return this.currentUser.activeProjectRole || 'Specialist';
        } else {
          return 'No es miembro';
        }
      } catch (error) {
        console.error('Error obteniendo rol de proyecto:', error);
        return 'Desconocido';
      }
    },

    // Método para inicializar los datos del usuario de forma asíncrona
    async initializeUserData() {/*
      try {
        // Primero obtenemos la información básica del usuario
        this.getUserInfo();
        
        // Si después de getUserInfo() no tenemos un memberId, lo cargamos de forma asíncrona
        if (this.currentUser && !this.currentUser.memberId && this.organizationId) {
          await this.loadUserMembership();
        }
        
        return this.currentUser;
      } catch (error) {
        console.error("Error inicializando datos de usuario:", error);
        // Asegurar que tenemos un objeto de usuario básico para evitar errores
        if (!this.currentUser) {
          this.currentUser = { activeOrganizationRole: 'Worker' };
          this.userRole = 'Worker';
        }
      }
    }*/
    },
    async created() {/*
    try {
      this.organizationId = this.route.params.orgId;
      await this.initializeUserData();
      this.loadProjects();
    } catch (error) {
      console.error("Error en created hook:", error);
      // Intentar continuar con una carga básica
      this.getUserInfo();
      this.loadProjects();
    }
  }
  */
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
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--red-500);"></i>
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
          <h3>{{ project.name }}</h3>
          <div>
            <pv-tag v-if="project.status" :severity="getStatusSeverity(project.status)" :value="project.status" class="mr-2" />
            <!-- Mostrar tag del rol en el proyecto si eres Worker -->
            <pv-tag v-if="userRole === 'Worker'" severity="info" :value="getProjectRole(project)" />
          </div>
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