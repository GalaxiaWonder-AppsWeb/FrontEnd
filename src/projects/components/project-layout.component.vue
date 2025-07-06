

<script>
import ToolbarComponent from '../../public/components/toolbar-content.component.vue';
import { useRoute } from 'vue-router';
import { ProjectRole } from '../model/project-role.js';

export default {
  name: 'ProjectLayout',
  
  components: {
    ToolbarComponent
  },
  
  data() {
    return {
      route: useRoute(),
      personId: null,
      organizationId: null,
      projectId: null,
      projectRole: null
    };
  },
  
  methods: {
    async determineProjectRole() {
      try {
        // 1. Obtener usuario desde localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.personId) {
          console.warn("No hay usuario autenticado o falta personId");
          return;
        }
        
        // 2. Obtener IDs necesarios
        this.personId = user.personId;
        this.organizationId = this.route.params.orgId;
        this.projectId = this.route.params.projectId;
        
        if (!this.organizationId || !this.projectId) {
          console.warn("No se pudo obtener los IDs necesarios de la URL");
          return;
        }
        
        // 3. Verificar si el usuario es Contractor en la organización
        // Si es Contractor, automáticamente es Coordinator en el proyecto
        if (user.activeOrganizationRole === 'Contractor') {
          user.activeProjectRole = ProjectRole.COORDINATOR;
          localStorage.setItem("user", JSON.stringify(user));
          return;
        }
      } catch (err) {
        console.error("Error al determinar rol en el proyecto:", err);
      }
    }
  },
  
  created() {
    // Usar nextTick para asegurar que los componentes y rutas estén completamente montados
    this.$nextTick(() => {
      this.determineProjectRole();
    });
  }
};
</script>

<template>
  <div class="project-layout">
    <ToolbarComponent />
    
    <main class="project-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.project-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.project-main {
  flex: 1;
  padding: 2rem;
  margin-top: 3.5rem; /* Ajuste para el toolbar fijo */
  overflow-y: auto;
}
</style>