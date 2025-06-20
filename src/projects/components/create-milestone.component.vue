<script setup>
import { ref, reactive } from 'vue';
import { Milestone } from '../model/milestone.entity.js';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },  projectId: {
    type: [Number, String], // Aceptar tanto número como cadena
    required: true,
    validator: (value) => {
      // Validar que sea un número o una cadena que se puede convertir a número
      return value !== undefined && value !== null && !isNaN(Number(value));
    }
  }
});

const emit = defineEmits(['update:visible', 'create', 'cancel']);

// Form data
const formData = reactive({
  name: '',
  startDate: new Date(),
  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
});

// Form validation
const errors = reactive({
  name: null,
  dates: null
});

// Reset form to initial state
const resetForm = () => {
  formData.name = '';
  formData.startDate = new Date();
  formData.endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
  
  // Clear errors
  errors.name = null;
  errors.dates = null;
};

// Validate form
const validateForm = () => {
  let isValid = true;
  
  // Validate name
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Milestone name is required';
    isValid = false;
  } else {
    errors.name = null;
  }
  
  // Validate dates
  if (!formData.startDate || !formData.endDate) {
    errors.dates = 'Start and end dates are required';
    isValid = false;
  } else if (formData.endDate < formData.startDate) {
    errors.dates = 'End date cannot be earlier than start date';
    isValid = false;
  } else {
    errors.dates = null;
  }
  
  return isValid;
};

// Create milestone
const createMilestone = () => {
  if (!validateForm()) {
    return;
  }
  
  try {    // Convertir projectId a número si es una cadena
    const projectId = typeof props.projectId === 'number' ? props.projectId : Number(props.projectId);
    const milestone = new Milestone({
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      projectId: projectId,
      items: []
    });
    
    // Use the milestone directly, as it now includes the projectId
    const milestoneData = milestone;
    
    emit('create', milestoneData);
    resetForm();
  } catch (error) {
    console.error('Error creating milestone:', error);
  }
};

// Cancel and close dialog
const cancelCreate = () => {
  resetForm();
  emit('cancel');
};

// Update visible property
const updateVisible = (value) => {
  emit('update:visible', value);
  if (!value) {
    resetForm();
  }
};
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
      <div class="milestone-icon">
        <i class="pi pi-flag"></i>
        <h3>New Project Milestone</h3>
      </div>
      
      <div class="form-field">
        <label for="name">Milestone Name*</label>
        <pv-input-text 
          id="name" 
          v-model="formData.name" 
          class="w-full" 
          :class="{ 'p-invalid': errors.name }"
          placeholder="Enter milestone name"
          autofocus
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>
      
      <div class="form-dates">
        <div class="form-field">
          <label for="startDate">Start Date*</label>
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
          <label for="endDate">End Date*</label>
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
          Milestones are key points in your project schedule that mark important phases or deliverables.
        </small>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <pv-button label="Cancel" icon="pi pi-times" class="p-button-text" @click="cancelCreate" />
        <pv-button label="Create" icon="pi pi-check" @click="createMilestone" />
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

