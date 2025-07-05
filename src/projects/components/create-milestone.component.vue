<script>
import { milestoneService } from '../services/milestone.service.js';

export default {
  name: 'CreateMilestone',
  props: {
    visible: { type: Boolean, default: false },
    projectId: { type: [String, Number], required: true }
  },
  data() {
    return {
      formData: {
        name: '',
        description: '',
        startDate: null,
        endDate: null,
      },
      errors: {},
      saving: false,
    }
  },
  watch: {
    visible(val) {
      if (val) this.resetForm();
    }
  },
  methods: {
    resetForm() {
      this.formData = {
        name: '',
        description: '',
        startDate: null,
        endDate: null,
      };
      this.errors = {};
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
    cancelCreate() {
      this.updateVisible(false);
    },
    validate() {
      this.errors = {};
      if (!this.formData.name.trim()) this.errors.name = 'Milestone name is required';
      if (!this.formData.startDate || !this.formData.endDate) {
        this.errors.dates = 'Start and end date are required';
      } else if (this.formData.startDate > this.formData.endDate) {
        this.errors.dates = 'End date must be after start date';
      }
      return Object.keys(this.errors).length === 0;
    },
    async createMilestone() {
      if (!this.validate()) return;

      this.saving = true;
      try {
        const payload = {
          name: this.formData.name,
          description: this.formData.description,
          projectId: Number(this.projectId),
          startDate: this.formData.startDate,
          endDate: this.formData.endDate,
        };
        await milestoneService.create(payload);

        this.$emit('milestoneCreated'); // O puedes pasarle el hito creado si el backend lo retorna
        this.updateVisible(false);
        this.$toast?.add?.({
          severity: 'success',
          summary: 'Milestone created!',
          detail: 'The milestone was successfully added.',
          life: 3000
        });
      } catch (e) {
        this.$toast?.add?.({
          severity: 'error',
          summary: 'Error',
          detail: e.message || 'Could not create milestone',
          life: 3000
        });
      } finally {
        this.saving = false;
      }
    }
  }
}
</script>

<template>
  <pv-dialog 
    :visible="visible" 
    @update:visible="updateVisible"
    :modal="true"
    :closable="false"
    :style="{ width: '500px' }"
    header="Create New Milestone"
  >
    <div class="form-container">
      
      <div class="form-field">
        <label for="name">{{ $t('schedule.create-milestone.name') }}</label>
        <pv-input-text 
          id="name" 
          v-model="formData.name" 
          class="w-full" 
          :class="{ 'p-invalid': errors.name }"
          :placeholder="$t('schedule.create-milestone.name-placeholder')"
          autofocus
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>

        <label for="name">{{ $t('schedule.create-milestone.description') }}</label>
        <pv-input-text
            id="name"
            v-model="formData.description"
            class="w-full"
            :class="{ 'p-invalid': errors.description }"
            :placeholder="$t('schedule.create-milestone.description-placeholder')"
            autofocus
        />
        <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
      </div>
      
      <div class="form-dates">
        <div class="form-field">
          <label for="startDate">{{ $t('schedule.create-milestone.start-date') }}</label>
          <pv-date-picker 
            id="startDate" 
            v-model="formData.startDate" 
            dateFormat="dd/mm/yy" 
            showIcon 
            class="w-full" 
            :class="{ 'p-invalid': errors.dates }"
          />
        </div>
        
        <div class="form-field">
          <label for="endDate">{{ $t('schedule.create-milestone.end-date') }}</label>
          <pv-date-picker 
            id="endDate" 
            v-model="formData.endDate" 
            dateFormat="dd/mm/yy" 
            showIcon 
            class="w-full" 
            :class="{ 'p-invalid': errors.dates }"
            :minDate="formData.startDate"
          />
        </div>
      </div>
      <small v-if="errors.dates" class="p-error">{{ errors.dates }}</small>
      
      <div class="form-info">
        <i class="pi pi-info-circle"></i>
        <small>
          {{ $t('schedule.create-milestone.key-point') }}
        </small>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <pv-button :label="$t('schedule.create-milestone.cancel')" icon="pi pi-times" class="p-button-text" @click="cancelCreate" />
        <pv-button :label="$t('schedule.create-milestone.create')" icon="pi pi-check" @click="createMilestone" />
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.milestone-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.milestone-icon i {
  font-size: 2rem;
  color: var(--primary-color);
  background: var(--primary-50);
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.milestone-icon h3 {
  margin: 0;
  color: var(--primary-color);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.form-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--surface-hover);
  padding: 0.75rem;
  border-radius: 4px;
}

.form-info i {
  color: var(--primary-color);
}

label {
  font-weight: 500;
}

.p-invalid {
  border-color: var(--red-500);
}

.p-error {
  color: var(--red-500);
}
</style>

