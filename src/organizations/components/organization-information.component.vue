<script>
import {organizationService} from "../services/organization.service.js";
import {OrganizationAssembler} from "../services/organization.assembler.js";
import {personService} from "../../shared/services/person.service.js";
export default {
  name: "OrganizationInformation",
  data() {
    return {
      organization: null,
      contractorName: null,
      api: organizationService,
      orgId: ''
    }
  },
  methods: {
    async loadInformation() {
      try {
        // 1. Obtener información de la organización
        const organizationData = await this.api.getById({ id: this.orgId });
        this.organization = OrganizationAssembler.toEntityFromResource(organizationData);

        // Seguridad para evitar errores de render
        if (!this.organization) {
          this.contractorName = "Información no disponible";
          return;
        }

        // 2. Obtener el contractorId de manera robusta
        const contractorId = (typeof this.organization.createdBy === 'object' && this.organization.createdBy !== null)
            ? this.organization.createdBy.value
            : this.organization.createdBy;

        // 3. Obtener datos del contratista
        if (contractorId) {
          try {
            let contractorData = await personService.getById(contractorId);
            if (contractorData && contractorData.firstName && contractorData.lastName) {
              this.contractorName = `${contractorData.firstName} ${contractorData.lastName}`;
            } else if (contractorData && contractorData.name && contractorData.lastName) {
              // Por compatibilidad si la API devuelve .name en vez de .firstName
              this.contractorName = `${contractorData.name} ${contractorData.lastName}`;
            } else {
              this.contractorName = "Información no disponible";
            }
          } catch (error) {
            console.error("Error durante la llamada al servicio personService.getById:", error);
            this.contractorName = "Error al cargar la información";
          }
        } else {
          this.contractorName = "Información no disponible";
        }

        } catch (error) {
        console.error("Error al cargar la información:", error);
        this.organization = null;
        this.contractorName = null;
      }
    },

    formatDate(dateString) {
      if (!dateString) return "Sin fecha";
      const date = new Date(dateString);
      // Verifica si es una fecha válida
      if (isNaN(date.getTime())) return "Sin fecha";
      return new Intl.DateTimeFormat('es-PE').format(date);
    }

  },
  created() {
    this.orgId = this.$route.params.orgId
    this.loadInformation();
  }
}

</script>

<template>
  <div class="organization-info-card" v-if="organization">
    <div class="info-block">
      <h3 class="label">{{ $t('organization.info-organization.business-name')}}</h3>
      <p class="value">{{ organization.legalName }}</p>
    </div>
    <div class="info-block">
      <h3 class="label">{{ $t('organization.edit-organization.commercial-name')}}</h3>
      <p class="value">{{ organization.commercialName }}</p>
    </div>
    <div class="info-block">
      <h3 class="label">{{ $t('organization.info-organization.ruc')}}</h3>
      <p class="value">{{ organization.ruc.value }}</p>
    </div>
    <div class="info-block">
      <h3 class="label">{{ $t('organization.info-organization.creation-date')}}</h3>
      <p class="value">{{ formatDate(organization.createdAt) }}</p>
    </div>
    <div class="info-block">
      <h3 class="label">{{ $t('organization.info-organization.contractor')}}</h3>
      <p class="value">{{ contractorName || "Información no disponible"
        }}</p>
    </div>
  </div>
</template>

<style scoped>
.organization-info-card {
  background-color: #f8fbfa;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  width: fit-content;
  margin: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.info-block {
  margin-bottom: 1.5rem;
}

.label {
  font-weight: 700;
  color: #101020;
  margin: 0;
}

.value {
  font-weight: 400;
  font-size: 1rem;
  color: #1c1c1c;
  margin: 0.25rem 0 0;
}
</style>