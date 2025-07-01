<script>
import {Button as PvButton, InputText as PvInputText, DatePicker as PvDatePicker, InputNumber as PvInputNumber} from "primevue";
import {Project} from "../model/project.entity.js";
import {ProjectStatus} from "../model/project-status.js";
import {projectService} from "../services/project.service.js";
import {Schedule} from "../model/schedule.entity.js";

export default {
  name: "CreateProject",
  components: {PvButton, PvInputText, PvDatePicker, PvInputNumber},
  props: {
    organizationId: {
      type: String,
      required: true
    }
  },
  emits: ['project-created'],
  data() {
    return {
      user: null,
      visible: false,
      loading: false,
      organizationData: null,
      form: {
        name: '',
        description: '',
        budget: 0,
        startingDate: new Date(),
        endingDate: new Date(new Date().setMonth(new Date().getMonth() + 6)), // Default 6 months from now
      },
      message: '',
      contractingEntityId: ''
    }
  },
  methods: {
      async createProject() {
      try {
        this.loading = true;
        // Verificar si el usuario tiene permisos para crear proyectos (debe ser Contractor)
        if (!this.user || this.user.activeOrganizationRole !== 'Contractor') {
          this.$toast.add({
            severity: 'error',
            summary: 'Acceso denegado',
            detail: 'Solo los contratistas pueden crear proyectos',
            life: 5000
          });
          this.loading = false;
          return;
        }

        // Validate dates
        if (new Date(this.form.endingDate) <= new Date(this.form.startingDate)) {
          throw new Error('La fecha de finalización debe ser posterior a la fecha de inicio');
        }

        // Create project
        const newProject = {
          name: this.form.name,
          description: this.form.description,
          budget: this.form.budget,
          startingDate: this.form.startingDate,
          endingDate: this.form.endingDate,
          organizationId: parseInt(this.organizationId),
          createdAt: new Date()
        };

        this.visible = false;
        
        // Show success message
        this.$toast.add({
          severity: 'success',
          summary: 'Proyecto creado',
          detail: `El proyecto "${createdProject.name}" ha sido creado exitosamente`,
          life: 3000
        });
        
        // Emit event
        this.$emit('project-created', createdProject.id);
        
        // Reset form
        this.resetForm();
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Error al crear el proyecto',
          life: 3000
        });
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.form = {
        name: '',
        description: '',
        budget: 0,
        startingDate: new Date(),
        endingDate: new Date(new Date().setMonth(new Date().getMonth() + 6))
      };
    }
  },
  computed: {
    isFormValid() {
      return (
        this.form.name.trim() !== '' &&
        this.form.description.trim() !== '' &&
        this.form.budget > 0
      );
    }
  }
};
</script>

<template>
  <div class="project-creator">
    <pv-button 
      icon="pi pi-plus" 
      :label="$t('projects.create')" 
      @click="showDialog" 
    />

    <pv-dialog 
      v-model:visible="visible" 
      modal 
      :header="$t('projects.create_dialog.title')" 
      :style="{ width: '40rem' }"
    >
      <div class="dialog-content">
        <div class="form-group">
          <label for="projectName">{{ $t('projects.create_dialog.name') }}</label>
          <pv-input-text 
            id="projectName" 
            v-model="form.name" 
            class="w-full" 
            :placeholder="$t('projects.create_dialog.name_placeholder')"
          />
        </div>

        <div class="form-group">
          <label for="projectDescription">{{ $t('projects.create_dialog.description') }}</label>
          <pv-input-text 
            id="projectDescription" 
            v-model="form.description" 
            class="w-full" 
            :placeholder="$t('projects.create_dialog.description_placeholder')"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="projectBudget">{{ $t('projects.create_dialog.budget') }}</label>
            <pv-input-number 
              id="projectBudget" 
              v-model="form.budget" 
              mode="currency" 
              currency="USD" 
              :minFractionDigits="2"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="startDate">{{ $t('projects.create_dialog.start_date') }}</label>
            <pv-date-picker
              id="startDate" 
              v-model="form.startingDate" 
              dateFormat="dd/mm/yy"
              showIcon
            />
          </div>
          
          <div class="form-group">
            <label for="endDate">{{ $t('projects.create_dialog.end_date') }}</label>
            <pv-date-picker 
              id="endDate" 
              v-model="form.endingDate" 
              dateFormat="dd/mm/yy"
              showIcon
              :minDate="form.startingDate"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="contractingEntityEmail">{{ $t('projects.create_dialog.contracting_entity_email') }}</label>
          <pv-input-text
              id="contractingEntityEmail"
              v-model="form.contractingEntityId"
              class="w-full"
              :placeholder="$t('projects.create_dialog.contracting_entity_email_placeholder')"
          />
        </div>


        <div class="dialog-actions">
          <pv-button 
            type="button" 
            :label="$t('common.cancel')" 
            severity="secondary" 
            @click="visible = false" 
          />
          <pv-button
            type="button"
            :label="$t('common.create')"
            :disabled="!isFormValid || loading"
            :loading="loading"
            @click="createProject"
          />
        </div>
      </div>
    </pv-dialog>
  </div>
</template>

<style scoped>
.project-creator {
  display: inline-block;
}

.dialog-content {
  padding: 1rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

label {
  font-weight: 600;
  color: var(--text-color);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>