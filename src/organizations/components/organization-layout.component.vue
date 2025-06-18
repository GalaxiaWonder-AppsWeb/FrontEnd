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
      isLoading: false
    }
  },
  components: {
    ToolbarComponent
  },  methods: {    async GetMemberType() {
      try {
        this.isLoading = true;
        // Obtener usuario desde localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.personId) {
          console.warn("No hay usuario autenticado o falta personId");
          return;
        }

        // Asignar personId desde el usuario y asegurarnos de que sea número
        this.personId = typeof user.personId === 'number' ? user.personId : Number(user.personId);
        // Obtener el ID de la organización desde la URL y convertirlo a número
        this.organizationId = typeof this.route.params.orgId === 'number' ? 
          this.route.params.orgId : Number(this.route.params.orgId);
        
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
          // Manejar la comparación de IDs ya sea como strings o como números
          const orgCreatedBy = organization ? organization.createdBy : null;
          const currentPersonId = this.personId;
          
          console.log(`Comparando createdBy=${orgCreatedBy} (${typeof orgCreatedBy}) con personId=${currentPersonId} (${typeof currentPersonId})`);
            // Comparación que funciona independientemente de si los IDs son strings o números
          const isCreator = organization && ((orgCreatedBy == currentPersonId) || 
            (String(orgCreatedBy) === String(currentPersonId)));
          
          if (isCreator) {
            console.log(`¡Usuario es creador de la organización! Verificando si ya tiene rol...`);
            
            // Si el usuario es el creador de la organización, SIEMPRE debe tener rol Contractor
            if (user.activeOrganizationRole !== "Contractor") {
              console.log(`Asignando rol Contractor al creador`);
              user.activeOrganizationRole = "Contractor";
              localStorage.setItem("user", JSON.stringify(user));
              console.log("Credenciales actualizadas (como creador)");
            } else {
              console.log("El usuario ya tiene rol Contractor, manteniendo");
            }
            
            this.isLoading = false;
            return; // Terminamos aquí al encontrar que es el creador
          }
        } catch (orgError) {
          console.error("Error al consultar datos de la organización:", orgError);
        }
        
        // 2. Si no es el creador, buscar en la tabla de miembros
        try {
          const res = await organizationMemberServiceCustom.getByPersonAndOrgIdCustom({
            personId: Number(this.personId),
            organizationId: Number(this.organizationId)
          });
          
          console.log("Respuesta del servicio de miembros:", res);
            // Verificar que res contiene datos antes de acceder a sus propiedades
          if (res && res.length > 0 && res[0] && res[0].type) {
            // Si el usuario ya tiene rol Contractor, no sobreescribirlo con Worker
            if (user.activeOrganizationRole === "Contractor") {
              console.log("El usuario ya tiene rol Contractor, NO asignando rol Worker");
            } else {
              console.log(`Asignando rol ${res[0].type} desde la tabla de miembros`);
              user.activeOrganizationRole = res[0].type;
              localStorage.setItem("user", JSON.stringify(user));
              console.log("Credenciales actualizadas (desde tabla de miembros):", user);
            }
            
            this.isLoading = false;
            return;
          }
        } catch (memberError) {
          console.error("Error al consultar servicio de miembros:", memberError);
        }
        
        // 3. Si los métodos anteriores fallaron, buscar directamente en la API
        await this.checkIfInvitedMember(user);
        
        // 4. Si todo lo demás falla, asignar un rol por defecto y no se ha asignado ya
        if (!user.activeOrganizationRole) {
          console.warn("No se pudo determinar el rol del usuario, asignando Worker por defecto");
          user.activeOrganizationRole = "Worker";
          localStorage.setItem("user", JSON.stringify(user));
          
          // Forzar un refresco para aplicar el nuevo rol
          console.log("Forzando recarga para aplicar permisos correctamente");
          window.location.reload();
        }
      } catch (err) {
        console.error("Error al obtener rol de organización:", err);
        // Si hay un error, asignar un rol por defecto
        try {
          const user = JSON.parse(localStorage.getItem("user"));
          if (user) {
            user.activeOrganizationRole = "Worker";
            localStorage.setItem("user", JSON.stringify(user));
            console.warn("Se asignó rol Worker por defecto debido a un error");
          }
        } catch (e) {
          console.error("Error al intentar asignar rol por defecto:", e);
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    // Método para verificar si el usuario es un miembro invitado a la organización
    async checkIfInvitedMember(user) {
      try {
        // Buscar todas las entradas en la tabla de miembros
        const apiBaseUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiBaseUrl}/members?personId=${user.personId}&organizationId=${this.organizationId}`);
        
        if (response.ok) {
          const members = await response.json();
          console.log("Miembros encontrados para este usuario:", members);
            if (members && members.length > 0) {
            // El usuario es un miembro de la organización
            const newRole = members[0].type || "Worker";
            const oldRole = user.activeOrganizationRole;
            
            // Solo actualizar si el rol ha cambiado
            if (newRole !== oldRole) {
              console.log(`Cambiando rol de ${oldRole} a ${newRole}`);
              user.activeOrganizationRole = newRole;
              localStorage.setItem("user", JSON.stringify(user));
              console.log("Usuario identificado como miembro, rol asignado:", user.activeOrganizationRole);
              
              // Forzar una actualización de la página para que se apliquen los permisos nuevos
              console.log("Forzando recarga para aplicar nuevos permisos");
              window.location.reload();
            } else {
              console.log(`El rol ${newRole} ya estaba asignado, no se requiere recarga.`);
            }
            
            return true;
          }
        }
        
        // Si llegamos aquí, el usuario no es miembro de la organización
        user.activeOrganizationRole = "Visitor";
        localStorage.setItem("user", JSON.stringify(user));
        console.log("Usuario no es miembro, asignado como visitante");
        return false;
      } catch (error) {
        console.error("Error al verificar si es miembro invitado:", error);
        user.activeOrganizationRole = "Visitor";
        localStorage.setItem("user", JSON.stringify(user));
        return false;
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