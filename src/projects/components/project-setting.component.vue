<template>
  <div class="settings-container">
    <form @submit.prevent="handleUpdate" class="p-fluid form-grid register-card">
      <h1 class="form-title">{{ $t('projects.settings.title') }}</h1>

      <!-- Mostrar un loader mientras se carga la información -->
      <div v-if="loading" class="loading-container">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>{{ $t('projects.loading') }}</p>
      </div>

      <div v-else>
        <div class="p-field">
          <label for="description">{{ $t('projects.settings.description') }}</label>
          <pv-textarea 
            id="description" 
            v-model="description" 
            rows="5" 
            :placeholder="$t('projects.settings.description_placeholder')"
            required 
            :class="{ 'p-invalid': description.trim() === '' }"
          />
          <small v-if="description.trim() === ''" class="p-error">
            {{ $t('projects.settings.error.empty_description') }}
          </small>
        </div>

        <div class="p-field">
          <label for="status">{{ $t('projects.settings.status') }}</label>          <pv-dropdown 
            id="status" 
            v-model="status" 
            :options="statusOptions" 
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('projects.settings.status_placeholder')"
            required 
            :class="{ 'p-invalid': status === null }"
          />
          <small v-if="status === null" class="p-error">
            {{ $t('projects.settings.error.no_status') }}
          </small>
        </div>

        <pv-button
          class="p-button"
          :label="$t('projects.settings.update')"
          icon="pi pi-save"
          type="submit"
          :disabled="!isValid"
          :loading="saving"
          :class="{ 'p-button-outlined': !hasChanges }"
          v-tooltip="!hasChanges ? $t('projects.settings.no_changes') : ''"
        />

        <p :class="messageClass">{{message}}</p>
        
        <div class="danger-zone">
          <h2>{{ $t('projects.settings.danger_zone') }}</h2>
          <div class="delete-section">
            <pv-button
              class="p-button-danger p-button-outlined"
              :label="$t('projects.settings.delete')"
              icon="pi pi-trash"
              @click="showDeleteConfirmation"
            />
          </div>
        </div>
      </div>
    </form>
    
    <pv-dialog v-model:visible="deleteDialogVisible" :modal="true" :closable="false" :header="$t('projects.settings.delete_dialog.title')" class="delete-dialog">
      <p>{{ $t('projects.settings.delete_dialog.message') }}</p>
      <template #footer>
        <pv-button :label="$t('common.cancel')" @click="deleteDialogVisible = false" class="p-button-text" />
        <pv-button :label="$t('common.delete')" @click="handleDeleteProject" class="p-button-danger" :loading="deleting" />
      </template>
    </pv-dialog>
  </div>
</template>

<script>
import { projectService } from '../services/project.service.js';
import { ProjectAssembler } from '../services/project.assembler.js';
import { Project } from '../model/project.entity.js';
import { ProjectStatus } from '../model/project-status.js';
import { ProjectStatusLabels } from '../services/project-status-labels.js';
import { useRoute, useRouter } from 'vue-router';
import { Button as PvButton, Textarea as PvTextarea, Dropdown as PvDropdown, Dialog as PvDialog } from "primevue";

export default {
  name: 'ProjectSettings',
  components: {
    PvButton,
    PvTextarea,
    PvDropdown,
    PvDialog
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    return { router, route };
  },  data() {
    return {
      projectId: null,
      organizationId: null,
      originalProject: null,
      description: '',
      status: null,
      originalDescription: '',
      originalStatus: null,
      message: '',
      messageClass: 'confirm-message',
      loading: false,
      saving: false,
      deleteDialogVisible: false,
      deleting: false,
      statusOptions: Object.keys(ProjectStatus).map(key => ({
        label: ProjectStatusLabels[this.$i18n.locale]?.[ProjectStatus[key]] || ProjectStatus[key],
        value: ProjectStatus[key]
      }))
    };
  },  computed: {
    isValid() {
      // Comprobar que hay datos válidos y que se ha cambiado algo
      return this.description?.trim() !== '' && 
        this.status !== null && 
        (this.description !== this.originalProject?.description || 
         this.status !== this.originalProject?.status);
    },
    
    hasChanges() {
      // Comprobar si se ha modificado algún campo
      return this.originalProject && 
        (this.description !== this.originalProject.description ||
         this.status !== this.originalProject.status);
    }
  },
  methods: {    async loadProject() {
      try {
        this.loading = true;
        this.projectId = this.route.params.projectId;
        this.organizationId = this.route.params.orgId;
        
        if (!this.projectId) {
          throw new Error('Project ID not found');
        }
        
        const res = await projectService.getById({ id: this.projectId });
        this.originalProject = ProjectAssembler.toEntityFromResource(res);
        this.description = this.originalProject.description;
        this.status = this.originalProject.status;
        
        // Guardar los valores originales para comparar cambios
        this.originalDescription = this.description;
        this.originalStatus = this.status;
      } catch (err) {
        console.error('Error loading project:', err);
        this.message = err.message;
        this.messageClass = 'error-message';        
        this.$toast.add({
          severity: 'error',
          summary: this.$t('projects.settings.error.loading_title'),
          detail: this.$t('projects.settings.error.loading_message'),
          life: 3000
        });
      } finally {
        this.loading = false;
      }
    },    async handleUpdate() {
      try {
        this.saving = true;
          // Validar que la descripción no esté vacía
        if (!this.description || this.description.trim() === '') {
          throw new Error(this.$t('projects.settings.error.empty_description'));
        }
        
        // Validar que el status esté seleccionado
        if (!this.status) {
          throw new Error(this.$t('projects.settings.error.no_status'));
        }
          console.log('Datos originales del proyecto:', this.originalProject);
        console.log('Contratista original:', this.originalProject.contractor);        // Obtener el valor original del contratista
        const contractorOriginalId = this.originalProject.contractor || this.originalProject.contractor;
        console.log('ID del contratista original:', contractorOriginalId);
        
        // Crear el proyecto actualizado con los nuevos valores
        const updatedProject = new Project({
          id: this.projectId,
          name: this.originalProject.name,
          description: this.description,
          status: this.status,
          budget: this.originalProject.budget,
          startingDate: this.originalProject.startingDate,
          endingDate: this.originalProject.endingDate,
          schedule: this.originalProject.schedule,
          team: this.originalProject.team,
          organizationId: this.originalProject.organizationId,
          // Pasar el ID del contratista directamente como valor primitivo
          contractor: contractorOriginalId,
          contractingEntityId: this.originalProject.contractingEntityId,
          createdBy: this.originalProject.createdBy,
          createdAt: this.originalProject.createdAt
        });
        
        console.log('Actualizando proyecto:', updatedProject.toJSON());
        console.log('Contratista en el proyecto actualizado:', updatedProject.contractor);        // Preparar el objeto para la actualización
        const projectData = updatedProject.toJSON();
        
        // Asegurarnos de que el ID del contratista se mantiene exactamente igual que en el servidor
        // Obtener directamente del objeto original sin procesamiento
        const rawContractorValue = this.originalProject.contractor || this.originalProject.contractor;
        console.log('Valor original del contratista (sin procesar):', rawContractorValue);
        
        // Asignar el valor original directamente
        projectData.contractor = rawContractorValue;
        
        console.log('Datos que serán enviados al servidor:', projectData);
        
        // Enviar la actualización al servidor
        const res = await projectService.update({
          id: this.projectId,
          ...projectData
        });
          this.message = this.$t('projects.settings.success.updated');
        this.messageClass = 'confirm-message';
        
        this.$toast.add({
          severity: 'success',
          summary: this.$t('projects.settings.success.title'),
          detail: this.$t('projects.settings.success.updated'),
          life: 3000
        });
        
        // Actualizar el proyecto original con los nuevos valores
        this.originalProject = updatedProject;
        this.originalDescription = this.description;
        this.originalStatus = this.status;      } catch (err) {
        console.error('Error updating project:', err);
        this.message = err.message;
        this.messageClass = 'error-message';
          this.$toast.add({
          severity: 'error',
          summary: this.$t('projects.settings.error.updating_title'),
          detail: this.$t('projects.settings.error.updating_message'),
          life: 3000
        });
      } finally {
        this.saving = false;
      }
    },
    
    showDeleteConfirmation() {
      this.deleteDialogVisible = true;
    },
      async handleDeleteProject() {
      try {
        this.deleting = true;
        this.message = '';
        
        console.log(`Eliminando proyecto con ID: ${this.projectId}`);
        
        // Eliminar el proyecto
        await projectService.delete({ id: this.projectId });
        
        // Cerrar el diálogo de confirmación
        this.deleteDialogVisible = false;
          // Mostrar mensaje de éxito
        this.$toast.add({
          severity: 'success',
          summary: this.$t('projects.settings.success.title'),
          detail: this.$t('projects.settings.success.deleted'),
          life: 3000
        });
        
        // Redirigir al usuario a la lista de proyectos
        setTimeout(() => {
          this.router.push(`/organizations/${this.organizationId}/projects`);
        }, 1500);
      } catch (err) {        console.error('Error deleting project:', err);
        this.message = this.$t('projects.settings.error.deleting_message');
        this.messageClass = 'error-message';
        
        // Obtener más detalles del error si están disponibles
        const errorMessage = err.message || this.$t('projects.settings.error.deleting_message');
        
        this.$toast.add({
          severity: 'error',
          summary: this.$t('projects.settings.error.deleting_title'),
          detail: errorMessage,
          life: 5000
        });
      } finally {
        this.deleting = false;
      }
    },
    
    setupStatusOptions() {
      // Determinar el idioma actual
      const currentLocale = this.$i18n.locale || 'en';
      
      // Crear opciones para el dropdown de status
      const labels = ProjectStatusLabels[currentLocale] || ProjectStatusLabels.en;
      this.statusOptions = Object.values(ProjectStatus).map(status => ({
        label: labels[status] || status,
        value: status
      }));
    },
  },  created() {
    this.loadProject();
    this.setupStatusOptions();
  },
  watch: {
    '$i18n.locale': function() {
      this.setupStatusOptions();
    }
  },
};
</script>

<style scoped>
.settings-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.register-card {
  max-width: 640px;
  margin: 3rem auto;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.15);
  color: black;
  background-color: white;
}

.form-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.p-field {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.confirm-message {
  color: #4caf50;
  text-align: center;
  margin-top: 1rem;
}

.error-message {
  color: #f44336;
  text-align: center;
  margin-top: 1rem;
}

.danger-zone {
  margin-top: 3rem;
  border-top: 1px solid #ddd;
  padding-top: 1.5rem;
}

.delete-section {
  margin-top: 1rem;
}

.delete-dialog {
  max-width: 450px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
}

.p-error {
  color: #f44336;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.p-invalid {
  border-color: #f44336 !important;
}
</style>