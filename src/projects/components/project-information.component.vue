<script>
import { useRoute, useRouter } from 'vue-router';
import { projectService } from "../services/project.service.js";
import {personService} from "../../shared/services/person.service.js";

export default {
  name: "ProjectInformation",  data() {
    return {
      route: useRoute(),
      router: useRouter(),
      project: null,
      creatorName: null,
      contractorName: null,
      contractingEntity: null,
      contractor: null,
      loading: false,
      error: null
    };
  },
  computed: {
    projectId() {
      // projectId de la ruta SIEMPRE string
      return this.route.params.projectId;
    },
    organizationId() {
      return this.route.params.orgId;
    }
  },
  methods: {
    async loadContractingEntity() {
      if (!this.project?.contractingEntityId) return;

      // Opción 2: espera solo el id
      console.log('XDda',this.project.contractingEntityId);

      const contractingEntity = await personService.getById(this.project.contractingEntityId);

      console.log('contractingEntity:', contractingEntity, 'typeof:', typeof contractingEntity);

      this.contractingEntity = contractingEntity;
    },
    async loadContractor() {
      if (!this.project?.contractor) return;

      // Opción 2: espera solo el id
      console.log('XDda',this.project.contractor);

      const contractor = await personService.getById(this.project.contractor);

      console.log('contractor:', contractor, 'typeof:', typeof contractor);

      this.contractor = contractor;
    },
    async loadProject() {
      this.loading = true;
      this.error = null;
      // Logs para debug de tipos y valores
      console.log('projectId:', this.projectId, 'typeof:', typeof this.projectId);
      try {
        // Llama al projectService con el parámetro que espera tu helper (ajusta si es projectId o id)
        const params = { id: parseInt(this.projectId) };
        console.log('Llamando projectService.getById con:', params, 'typeof:', typeof params.id);

        // Haz la llamada
        const response = await projectService.getById(params);
        console.log('Respuesta de projectService.getById:', response, 'typeof:', typeof response);

        const project = await projectService.getById({ id: this.projectId });
        console.log('Respuesta de projectService.getById:', project, 'typeof:', typeof project);


        // Aquí asignas directo:
        this.project = project;

        await this.loadContractingEntity(); // Llama después de cargar el proyecto
        await this.loadContractor();

        // Si tu service retorna Response, parsea el JSON
        if (response && response.ok !== undefined) {
          if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(`Error al cargar proyecto: ${response.status} ${errMsg}`);
          }
          const project = await response.json();
          console.log('Proyecto recibido:', project, 'typeof:', typeof project);
          this.project = project;
        }
        // Si tu service retorna JSON directo, comenta lo de arriba y usa esto:
        // else {
        //   console.log('Proyecto recibido (json directo):', response, 'typeof:', typeof response);
        //   this.project = response;
        // }

        // Cargar información del creador y contratista si existen

      } catch (error) {
        console.error('Error cargando proyecto:', error);
        this.error = `No se pudo cargar el proyecto: ${error.message}`;
      } finally {
        this.loading = false;
      }
    },
    goBack() {
      this.router.push(`/organizations/${this.organizationId}/projects`);
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    }
  },
  created() {
    this.loadProject();
  }
};
</script>

<template>
  <div class="project-view-container">
    <div class="back-navigation">
      <pv-button 
        icon="pi pi-arrow-left" 
        label="Volver a proyectos" 
        class="p-button-text" 
        @click="goBack"
      />
    </div>
    
    <div v-if="loading" class="loading-indicator">
      <pv-progress-spinner />
      <span>Cargando proyecto...</span>
    </div>
    
    <div v-else-if="error" class="error-message">
      <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--red-500);"></i>
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="project" class="project-content">
      <div class="project-header">
        <h1>{{ project.projectName }}</h1>
        <pv-tag v-if="project.status" :value="project.status" />
      </div>
      
      <div class="info-card">
        <h2>Información general</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Descripción</span>
            <span class="value">{{ project.description || 'Sin descripción' }}</span>
          </div>
          
          <div class="info-item">
            <span class="label">Presupuesto</span>
            <span class="value">{{ project.budget ? `$${project.budget.toLocaleString()}` : 'No especificado' }}</span>
          </div>
          
          <div class="info-item">
            <span class="label">Fecha de inicio</span>
            <span class="value">{{ formatDate(project.startDate) || 'No especificada' }}</span>
          </div>
            <div class="info-item">
            <span class="label">Fecha de finalización</span>
            <span class="value">{{ formatDate(project.endDate) || 'No especificada' }}</span>
          </div>          <div class="info-item">
            <span class="label">Contratista</span>
            <span class="value">{{ contractor.email || 'No especificado' }} <small v-if="contractorName && project.contractor">(ID: {{ project.contractor }})</small></span>
          </div>
          
          <div class="info-item">
            <span class="label">Entidad Contratante</span>
            <span class="value">{{ contractingEntity.email || 'No especificado' }} <small v-if="creatorName && project.contractor">(ID: {{ contractingEntity.email }})</small></span>
          </div>

        </div>
      </div>
    </div>
    
    <div v-else class="not-found">
      <p>Proyecto no encontrado</p>
      <pv-button label="Volver a la lista de proyectos" @click="goBack" />
    </div>
  </div>
</template>

<style scoped>
.project-view-container {
  padding: 1rem;
}

.back-navigation {
  margin-bottom: 1.5rem;
}

.loading-indicator,
.error-message,
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 3rem 0;
}

.error-message {
  color: var(--red-700);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background-color: #1a365d;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 5px solid #60a5fa;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.project-header h1 {
  margin: 0;
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: 600;
}

.info-card {
  background-color: #334155;
  border: 1px solid #3b82f6;
  border-radius: 10px;
  padding: 1.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  margin-bottom: 2rem;
  color: #f8fafc;
}

.info-card h2 {
  color: #ffffff;
  border-bottom: 2px solid #60a5fa;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  background-color: #1e293b;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #475569;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
}

.label {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.value {
  font-size: 1.1rem;
  color: #ffffff;
  word-break: break-word;
}

.feature-placeholder {
  background-color: #f0f7ff;
  border-radius: 8px;
  padding: 2rem;
  border: 1px solid #d0e1fd;
  margin-top: 2rem;
}

.feature-placeholder h3 {
  color: #0066cc;
  margin-top: 0;
}

.feature-placeholder ul {
  padding-left: 1.5rem;
}

.feature-placeholder li {
  margin-bottom: 0.5rem;
}
</style>
