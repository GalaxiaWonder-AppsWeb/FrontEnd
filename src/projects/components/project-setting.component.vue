<template>
  <div class="settings-container">
    <form @submit.prevent="handleUpdate" class="p-fluid form-grid register-card">
      <h1 class="form-title">{{ $t('projects.settings.title') }}</h1>
      <div v-if="loading" class="loading-container">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>{{ $t('projects.loading') }}</p>
      </div>
      <div v-else>
        <!-- Campo para editar el nombre -->
        <div class="p-field">
          <label for="name">{{ $t('projects.settings.name') }}</label>
          <pv-input-text
              id="name"
              v-model="name"
              :placeholder="$t('projects.settings.name_placeholder')"
              required
              :class="{ 'p-invalid': name.trim() === '' }"
          />
          <small v-if="name.trim() === ''" class="p-error">
            {{ $t('projects.settings.error.empty_name') || 'El nombre no puede estar vacío.' }}
          </small>
        </div>

        <!-- Descripción -->
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

        <!-- Estado -->
        <div class="p-field">
          <label for="status">{{ $t('projects.settings.status') }}</label>
          <pv-select
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
        <div class="p-field">
          <label for="startDate">{{ $t('projects.settings.start_date') }}</label>
          <pv-date-picker
              id="startDate"
              v-model="startDate"
              :placeholder="$t('projects.settings.start_date_placeholder')"
              :minDate="null"
              showIcon
              required
          />
        </div>
        <div class="p-field">
          <label for="endDate">{{ $t('projects.settings.end_date') }}</label>
          <pv-date-picker
              id="endDate"
              v-model="endDate"
              :placeholder="$t('projects.settings.end_date_placeholder')"
              :minDate="startDate"
              showIcon
              required
          />
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

        <p :class="messageClass">{{ message }}</p>

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
import { ProjectStatus } from '../model/project-status.js';
import { ProjectStatusLabels } from '../services/project-status-labels.js';
import { useRoute, useRouter } from 'vue-router';
import { Button as PvButton, Textarea as PvTextarea, Select as PvSelect, Dialog as PvDialog, InputText as PvInputText } from "primevue";

export default {
  name: 'ProjectSettings',
  components: {
    PvButton,
    PvTextarea,
    PvSelect,
    PvDialog,
    PvInputText
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    return { router, route };
  },
  data() {
    return {
      startDate: null,
      endDate: null,
      projectId: null,
      organizationId: null,
      originalProject: null,
      name: '',
      description: '',
      status: null,
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
  },
  computed: {
    isValid() {
      return (
          this.name.trim() !== '' &&
          this.description.trim() !== '' &&
          this.status !== null &&
          (
              this.name !== this.originalProject?.name ||
              this.description !== this.originalProject?.description ||
              this.status !== this.originalProject?.status ||
              this.startDate !== this.originalProject?.startDate ||
              this.endDate !== this.originalProject?.endDate
          )
      );
    },
    hasChanges() {
      return this.originalProject &&
          (
              this.name !== this.originalProject.name ||
              this.description !== this.originalProject.description ||
              this.status !== this.originalProject.status
              || this.startDate?.toISOString() !== this.originalProject.startDate?.toISOString()
              || this.endDate?.toISOString() !== this.originalProject.endDate?.toISOString()
          );
    },
    hasDateRangeChanged() {
      return (
          this.startDate?.toISOString() !== this.originalProject?.startDate?.toISOString() ||
          this.endDate?.toISOString() !== this.originalProject?.endDate?.toISOString()
      );
    }
  },
  methods: {
    async loadProject() {
      try {
        this.loading = true;
        this.projectId = this.route.params.projectId;
        this.organizationId = this.route.params.orgId;

        if (!this.projectId) {
          throw new Error('Project ID not found');
        }
        // Trae el proyecto desde el backend (¡verifica el objeto que retorna!)
        const res = await projectService.getById({ id: this.projectId });

        this.startDate = res.startDate ? new Date(res.startDate) : null;
        this.endDate = res.endDate ? new Date(res.endDate) : null;


        // Llenar los campos del formulario con los valores actuales
        this.name = res.projectName || res.name || '';
        this.description = res.description || '';
        this.startDate = res.startDate ? new Date(res.startDate) : null;
        this.endDate = res.endDate ? new Date(res.endDate) : null;
        this.status = res.status || null;

        // Guardar el proyecto original para comparar cambios
        this.originalProject = {
          name: this.name,
          description: this.description,
          status: this.status,
          startDate: this.startDate,
          endDate: this.endDate
        };
      } catch (err) {
        console.error('Error loading project:', err);
        this.message = err.message;
        this.messageClass = 'error-message';
        this.$toast?.add?.({
          severity: 'error',
          summary: this.$t('projects.settings.error.loading_title'),
          detail: this.$t('projects.settings.error.loading_message'),
          life: 3000
        });
      } finally {
        this.loading = false;
      }
    },
    async handleUpdate() {
      try {
        this.saving = true;
        if (!this.name || this.name.trim() === '') {
          throw new Error(this.$t('projects.settings.error.empty_name') || 'El nombre no puede estar vacío.');
        }
        if (!this.description || this.description.trim() === '') {
          throw new Error(this.$t('projects.settings.error.empty_description'));
        }
        if (!this.status) {
          throw new Error(this.$t('projects.settings.error.no_status'));
        }
        if (this.hasDateRangeChanged) {
          await projectService.updateDateRange({
            projectId: this.projectId,
            startDate: this.startDate,
            endDate: this.endDate
          });
        }
        // Actualización de nombre, descripción y estado (status)
        // Puedes actualizar cada campo con su endpoint PATCH correspondiente o uno solo según tu backend

        await projectService.updateName({ id: this.projectId, name: this.name });
        await projectService.updateDescription({ id: this.projectId, description: this.description });
        await projectService.updateStatus?.({ id: this.projectId, status: this.status }); // Solo si existe el endpoint

        this.message = this.$t('projects.settings.success.updated');
        this.messageClass = 'confirm-message';
        this.$toast?.add?.({
          severity: 'success',
          summary: this.$t('projects.settings.success.title'),
          detail: this.$t('projects.settings.success.updated'),
          life: 3000
        });

        // Actualiza los datos originales
        this.originalProject = {
          name: this.name,
          description: this.description,
          status: this.status
        };
      } catch (err) {
        console.error('Error updating project:', err);
        this.message = err.message;
        this.messageClass = 'error-message';
        this.$toast?.add?.({
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
        await projectService.delete({ id: this.projectId });
        this.deleteDialogVisible = false;
        this.$toast?.add?.({
          severity: 'success',
          summary: this.$t('projects.settings.success.title'),
          detail: this.$t('projects.settings.success.deleted'),
          life: 3000
        });
        setTimeout(() => {
          this.router.push(`/organizations/${this.organizationId}/projects`);
        }, 1500);
      } catch (err) {
        console.error('Error deleting project:', err);
        this.message = this.$t('projects.settings.error.deleting_message');
        this.messageClass = 'error-message';
        const errorMessage = err.message || this.$t('projects.settings.error.deleting_message');
        this.$toast?.add?.({
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
      const currentLocale = this.$i18n.locale || 'en';
      const labels = ProjectStatusLabels[currentLocale] || ProjectStatusLabels.en;
      this.statusOptions = Object.values(ProjectStatus).map(status => ({
        label: labels[status] || status,
        value: status
      }));
    },
  },
  created() {
    this.loadProject();
    this.setupStatusOptions();
  },
  watch: {
    '$i18n.locale': function() {
      this.setupStatusOptions();
    }
  }
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


.p-field textarea,
.pv-textarea,
.p-inputtextarea {
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
  height: 120px !important;  /* Ajusta a tu preferencia */
  min-height: 120px !important;
  max-height: 120px !important;
  resize: none !important;
  box-sizing: border-box;
  font-family: inherit;
}
.p-button-danger,
.p-button-danger:enabled:hover,
.p-button-danger:enabled:active,
.p-button-danger.p-button-outlined {
  background-color: #e53935 !important;
  border-color: #e53935 !important;
  color: #fff !important;
}
</style>