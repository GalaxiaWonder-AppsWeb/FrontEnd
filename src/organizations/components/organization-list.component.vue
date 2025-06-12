<script>
import OrganizationItem from "./organization-item.component.vue";
import {organizationService} from "../services/organization.service.js";
import {OrganizationAssembler} from "../services/organization.assembler.js";
import CreateOrganization from "./create-organization.component.vue";

export default {
  name: "OrganizationList",
  components: {CreateOrganization, OrganizationItem},
  data() {
    return {
      organizations: [],
      api: organizationService,
      owner: ''
    }
  },  created() {
    this.owner = JSON.parse(localStorage.getItem("user"));
    this.loadOrganizations();
    
    // Escuchar evento de actualización de organizaciones
    window.addEventListener('organizations-updated', this.handleOrganizationsUpdated);
  },
  
  beforeUnmount() {
    // Limpiar escucha de eventos para evitar memory leaks
    window.removeEventListener('organizations-updated', this.handleOrganizationsUpdated);
  },  methods: {
    handleOrganizationsUpdated() {
      console.log("Evento de actualización de organizaciones recibido");
      // Recargar las organizaciones cuando se acepta una invitación
      this.loadOrganizations();
    },
    async loadOrganizations(){
      console.log("Owner: ", this.owner)
      if (!this.owner || !this.owner.personId) {
        console.error("No hay usuario logueado o falta ID de persona");
        return;
      }
      
      try {
        const createdOrgs = await this.api.getByCreatedBy({createdBy: this.owner.personId});
        
        // Obtener todas las organizaciones donde el usuario es miembro
        const resp = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/members?personId=${this.owner.personId}`);
        const memberData = await resp.json();
        
        // Obtener los IDs de organizaciones donde el usuario es miembro
        const orgIds = memberData.map(member => member.organizationId);
        
        // Obtener detalles de cada organización donde el usuario es miembro
        const memberOrgs = [];
        for (const orgId of orgIds) {
          try {
            const org = await this.api.getById(orgId);
            if (org) {
              memberOrgs.push(org);
            }
          } catch (err) {
            console.error(`Error al obtener organización ${orgId}:`, err);
          }
        }
        
        // Combinar organizaciones creadas y organizaciones donde es miembro
        const allOrgs = [...createdOrgs, ...memberOrgs];
        
        // Filtrar duplicados (por si acaso)
        const uniqueIds = new Set();
        const uniqueOrgs = [];
        
        allOrgs.forEach(org => {
          if (org && org.id && !uniqueIds.has(org.id)) {
            uniqueIds.add(org.id);
            uniqueOrgs.push(org);
          }
        });
        
        this.organizations = OrganizationAssembler.toEntitiesFromResponse(uniqueOrgs);
      } catch (error) {
        console.error("Error al cargar organizaciones:", error);
      }
    }
  }
}
</script>

<template>
  <div class="organization-items" v-if="organizations.length">
    <OrganizationItem
        v-for="(item, index) in organizations"
        :key="index"
        :organization="item"
    />
  </div>  <div v-else>
    <p>{{ $t('organization.no-organizations') }}</p>
  </div>
  <CreateOrganization @organization-created="handleOrganizationsUpdated" />
</template>

<style scoped>
.organization-items {
  padding-top: 80px;
}
</style>