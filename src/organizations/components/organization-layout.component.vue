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
import { organizationMemberService, organizationMemberServiceCustom } from "../services/organization-member.service.js";
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
  },  methods: {    async GetMemberType() {
      try {
        // Obtener usuario desde localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.personId) {
          console.warn("No hay usuario autenticado o falta personId");
          return;
        }
        
        // Asignar personId desde el usuario
        this.personId = user.personId;
        // Obtener el ID de la organización desde la URL
        this.organizationId = this.route.params.orgId;
        
        if (!this.organizationId) {
          console.warn("No se pudo obtener el ID de la organización desde la URL");
          return;
        }
        
        console.log(`Obteniendo rol para personId=${this.personId} en organizationId=${this.organizationId}`);
        // 1. Primero, verificar si el usuario es el creador de la organización
        try {
          console.log(`Consultando organización ${this.organizationId}`);
          
          // Importar el servicio de organización que ahora usa caché
          const { organizationService } = await import('../services/organization.service.js');
          const organization = await organizationService.getById(this.organizationId);
          
          if (organization && organization.createdBy === this.personId) {
            console.log(`¡Usuario es creador de la organización! Asignando rol Contractor`);
            user.activeOrganizationRole = "Contractor";
            localStorage.setItem("user", JSON.stringify(user));
            console.log("Credenciales actualizadas (como creador)");
            return; // Terminamos aquí al encontrar que es el creador
          }
        } catch (orgError) {
          console.error("Error al consultar datos de la organización:", orgError);
        }
        
        // 2. Si no es el creador, buscar en la tabla de miembros
        const res = await organizationMemberServiceCustom.getByPersonAndOrgIdCustom({
          personId: this.personId,
          organizationId: this.organizationId
        });
        
        console.log("Respuesta del servicio de miembros:", res);
        
        // Verificar que res contiene datos antes de acceder a sus propiedades
        if (res && res.length > 0 && res[0] && res[0].type) {
          user.activeOrganizationRole = res[0].type;
          localStorage.setItem("user", JSON.stringify(user));
          console.log("Credenciales actualizadas (desde tabla de miembros):", user);
        } else {
          console.warn("No se pudo obtener el tipo de miembro, respuesta incompleta:", res);
          // Establecer un rol por defecto si no hay respuesta válida
          user.activeOrganizationRole = "Visitor";
          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch (err) {
        console.error("Error al obtener rol de organización:", err);
      }
    }
  },
  created() {
    // Usar nextTick para asegurar que los componentes y rutas estén completamente montados
    this.$nextTick(() => {
      this.GetMemberType();
    });
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