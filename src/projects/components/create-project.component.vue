<script>
import {Button as PvButton, InputText as PvInputText, Calendar as PvCalendar, InputNumber as PvInputNumber} from "primevue";
import {Project} from "../model/project.entity.js";
import {ProjectStatus} from "../model/project-status.js";
import {projectService} from "../services/project.service.js";
import {Schedule} from "../model/schedule.entity.js";

export default {
  name: "CreateProject",
  components: {PvButton, PvInputText, PvCalendar, PvInputNumber},
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
      creatorId: null,
      form: {
        name: '',
        description: '',
        budget: 0,
        startingDate: new Date(),
        endingDate: new Date(new Date().setMonth(new Date().getMonth() + 6)), // Default 6 months from now
      },
      message: ''
    }
  },
  methods: {    
    async loadOrganizationData() {
      try {
        // Obtener información de la organización para identificar al creador
        const response = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000'}/organizations/${this.organizationId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error al cargar la organización: ${response.statusText}`);
        }
        
        this.organizationData = await response.json();
        if (!this.organizationData.createdBy) {
          throw new Error('La organización no tiene un creador asignado');
        }
        
        this.creatorId = this.organizationData.createdBy;
        
        console.log("Organización cargada:", this.organizationData);
        console.log("Creador de la organización ID:", this.creatorId);
      } catch (error) {
        console.error("Error al cargar datos de la organización:", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información de la organización',
          life: 3000
        });
      }
    },
    
    async createProject() {
      try {
        this.loading = true;
        
        // Asegurarnos que tenemos la información del creador de la organización
        if (!this.creatorId) {
          await this.loadOrganizationData();
          if (!this.creatorId) {
            throw new Error('No se pudo identificar al creador de la organización');
          }
        }
        
        // Validate dates
        if (new Date(this.form.endingDate) <= new Date(this.form.startingDate)) {
          throw new Error('La fecha de finalización debe ser posterior a la fecha de inicio');
        }
        
        // Create project
        const newProject = {
          name: this.form.name,
          description: this.form.description,
          status: ProjectStatus.BASIC_STUDIES,
          budget: this.form.budget,
          startingDate: this.form.startingDate,
          endingDate: this.form.endingDate,
          schedule: {},
          team: [],          organizationId: this.organizationId,
          createdAt: new Date(),
          createdBy: this.user?.personId || null, // El usuario actual que está creando el proyecto
          contractor: this.creatorId // El creador de la organización
        };
        
        console.log("Creando proyecto con datos:", newProject);
        
        // Call API to create project
        const response = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000'}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(newProject)
        });
        
        if (!response.ok) {
          throw new Error(`Error al crear proyecto: ${response.statusText}`);
        }
        
        const createdProject = await response.json();
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
    
    showDialog() {
      this.visible = true;
      
      // Cargar datos de la organización cuando se abre el diálogo
      if (!this.creatorId) {
        this.loadOrganizationData();
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
  created() {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      this.user = JSON.parse(userData);
    }
    
    // Cargar datos de la organización
    this.loadOrganizationData();
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
            <pv-calendar 
              id="startDate" 
              v-model="form.startingDate" 
              dateFormat="dd/mm/yy"
              showIcon
            />
          </div>
          
          <div class="form-group">
            <label for="endDate">{{ $t('projects.create_dialog.end_date') }}</label>
            <pv-calendar 
              id="endDate" 
              v-model="form.endingDate" 
              dateFormat="dd/mm/yy"
              showIcon
              :minDate="form.startingDate"
            />
          </div>
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