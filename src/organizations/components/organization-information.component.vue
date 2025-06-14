<script>
import {organizationService} from "../services/organization.service.js";
import {OrganizationAssembler} from "../services/organization.assembler.js";
import {personService} from "../services/person.service.js";
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
        

        // 2. Obtener el ID del contratista (createdBy)
        let contractorId = null;
        
        // Verificar que createdBy exista y tenga la propiedad value
        if (this.organization && this.organization.createdBy && this.organization.createdBy) {
          contractorId = this.organization.createdBy;
        } 
        // Si createdBy es directamente una cadena de texto (por ejemplo, en formato JSON directo de la API)
        else if (this.organization && this.organization.createdBy && typeof this.organization.createdBy === 'number') {
          contractorId = this.organization.createdBy;
        }
        
        
        // 3. Hacer una llamada al endpoint /persons/:id para obtener el nombre completo
        if (contractorId) {
          try {
            console.log("Haciendo llamada al endpoint /persons/:id");
            // Primero intentar con la ruta directa
            let contractorData = await personService.getById(contractorId);
            
            // Si no hay datos, intentar hacer una solicitud fetch directa como fallback
            if (!contractorData) {
              console.log("Intentando obtener datos con fetch directo");
              const response = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/persons/${contractorId}`);
              if (response.ok) {
                contractorData = await response.json();
              }
            }
            
            console.log("Datos del contratista recibidos:", contractorData);
            
            // Verificar si tenemos un objeto válido y acceder a los datos correctamente
            if (contractorData) {
              // Si los datos vienen directamente en el objeto contractorData
              if (contractorData.name) {
                this.contractorName = `${contractorData.name.trim()} ${contractorData.lastName.trim()}`;
              } 
              // Si los datos vienen en una propiedad data dentro de contractorData
              else if (contractorData.data && contractorData.data.name) {
                this.contractorName = `${contractorData.data.name.trim()} ${contractorData.data.lastName.trim()}`;
              } else {
                this.contractorName = "Información no disponible";
              }
            } else {
              this.contractorName = "Información no disponible";
            }
          } catch (error) {
            console.error("Error durante la llamada al servicio personService.getById:", error);
            this.contractorName = "Error al cargar la información";
          }
        }
      } catch (error) {
        console.error("Error al cargar la información:", error);
        this.organization = null;
        this.contractorName = null;
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('es-PE').format(date)
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