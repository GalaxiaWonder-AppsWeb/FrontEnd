<script>
import OrganizationItem from "./organization-item.component.vue";
import {organizationService} from "../services/organization.service.js";
import {OrganizationAssembler} from "../services/organization.assembler.js";
import CreateOrganization from "./create-organization.component.vue";
import { personService } from "../../shared/services/person.service.js";

export default {
  name: "OrganizationList",
  components: {CreateOrganization, OrganizationItem},
  data() {
    return {
      personData: null,
      organizations: [],
      api: organizationService,
      owner: ''
    }
  },
  created() {
    this.fetchPersonData();
    this.owner = JSON.parse(localStorage.getItem("user"));
    this.loadOrganizations();
    
    // Escuchar evento de actualización de organizaciones
    window.addEventListener('organizations-updated', this.handleOrganizationsUpdated);
  },
  
  beforeUnmount() {
    // Limpiar escucha de eventos para evitar memory leaks
    window.removeEventListener('organizations-updated', this.handleOrganizationsUpdated);
  },

  methods: {

    async fetchPersonData() {
      try {
        // Obtener el usuario actual guardado (de localStorage)
        const user = JSON.parse(localStorage.getItem('user'))
        if (!user || !user.personId) {
          throw new Error('No hay usuario logueado o falta personId')
        }
        // Llama al servicio (esto usará el JWT automáticamente por BaseService)
        const person = await personService.getById(user.personId )
        // Puedes asignar a una variable reactiva si lo deseas
        this.personData = person
      } catch (err) {
        console.error('Error obteniendo persona:', err)
      }
    },

    handleOrganizationsUpdated() {
      // Recargar las organizaciones cuando se acepta una invitación
      this.loadOrganizations();
    },

    async loadOrganizations() {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.personId) {
        console.error("No hay usuario logueado o falta ID de persona");
        return;
      }
      try {
        // Llama directamente al nuevo método
        const organizations = await this.api.getByPersonId(user.personId);

        // Si necesitas convertir a entidades internas:
        this.organizations = OrganizationAssembler.toEntitiesFromResponse(organizations);
      } catch (error) {
        console.error("Error al cargar organizaciones:", error);
      }
    }
  }
}
</script>

<template>
  <CreateOrganization @organization-created="handleOrganizationsUpdated" />
  <div class="organization-items" v-if="organizations.length">
    <OrganizationItem
        v-for="(item, index) in organizations"
        :key="index"
        :organization="item"
    />
  </div>  <div v-else>
    <p>{{ $t('organization.no-organizations') }}</p>
  </div>
  
</template>

<style scoped>

</style>