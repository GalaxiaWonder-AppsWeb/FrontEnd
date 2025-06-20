<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { Task } from '../model/task.entity.js';
import { TaskStatus } from '../model/task-status.js';
import { Specialty } from '../model/specialty.js';
import Dropdown from 'primevue/dropdown';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  milestoneId: {
    type: Number,
    required: true
  }
});

// Register the Dropdown component for use in this component only
const PvDropdown = Dropdown;

const emit = defineEmits(['update:visible', 'create', 'cancel']);

// Form data
const formData = reactive({
  name: '',
  specialty: Specialty.ARCHITECTURE,
  startingDate: new Date(),
  dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
});

// Form validation
const errors = reactive({
  name: null,
  dates: null
});

// Reset form to initial state
const resetForm = () => {
  formData.name = '';
  formData.specialty = Specialty.ARCHITECTURE;
  formData.startingDate = new Date();
  formData.dueDate = new Date(new Date().setDate(new Date().getDate() + 7));
  
  // Clear errors
  errors.name = null;
  errors.dates = null;
};

// Specialties for dropdown
const specialties = Object.keys(Specialty).map(key => ({
  label: Specialty[key],
  value: Specialty[key]
}));

// Validate form
const validateForm = () => {
  let isValid = true;
  
  // Validate name
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Task name is required';
    isValid = false;
  } else {
    errors.name = null;
  }
  
  // Validate dates
  if (!formData.startingDate || !formData.dueDate) {
    errors.dates = 'Start and due dates are required';
    isValid = false;
  } else if (formData.dueDate < formData.startingDate) {
    errors.dates = 'Due date cannot be earlier than start date';
    isValid = false;
  } else {
    errors.dates = null;
  }
  
  return isValid;
};

// Create task
const createTask = () => {
  if (!validateForm()) {
    return;
  }
    try {
    const task = new Task({
      name: formData.name,
      specialty: formData.specialty,
      status: TaskStatus.DRAFT,
      startingDate: formData.startingDate,
      dueDate: formData.dueDate,
      milestoneId: props.milestoneId,
      responsible: null
    });
    
    emit('create', task);
    resetForm();
  } catch (error) {
    console.error('Error creating task:', error);
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
};

// Min date for end date (can't be before start date)
const minDueDate = computed(() => {
  return formData.startingDate || new Date();
});

// Reset form when dialog opens
watch(() => props.visible, (newValue) => {
  if (newValue === true) {
    resetForm();
  }
});
</script>

<template>
  <pv-dialog 
    :visible="visible" 
    @update:visible="updateVisible"
    :modal="true"
    :closable="false"
    :style="{ width: '500px' }"
    header="Create New Task"
  >
    <div class="form-container">
      <div class="form-field">
        <label for="name">Task Name*</label>
        <pv-input-text 
          id="name" 
          v-model="formData.name" 
          class="w-full" 
          :class="{ 'p-invalid': errors.name }"
          autofocus
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>        <div class="form-field">
        <label for="specialty">Specialty*</label>
        <pv-select 
          id="specialty" 
          v-model="formData.specialty" 
          :options="specialties" 
          optionLabel="label" 
          optionValue="value"
          placeholder="Select a specialty" 
          class="w-full"
        />
      </div>
      
      <div class="form-dates">
        <div class="form-field">
          <label for="startingDate">Start Date*</label>
          <pv-date-picker 
            id="startingDate" 
            v-model="formData.startingDate" 
            dateFormat="dd/mm/yy" 
            showIcon 
            class="w-full" 
            :class="{ 'p-invalid': errors.dates }"
          />
        </div>
        
        <div class="form-field">
          <label for="dueDate">Due Date*</label>
          <pv-date-picker 
            id="dueDate" 
            v-model="formData.dueDate" 
            dateFormat="dd/mm/yy" 
            showIcon 
            class="w-full" 
            :class="{ 'p-invalid': errors.dates }"
            :minDate="minDueDate"
          />
        </div>
      </div>
      <small v-if="errors.dates" class="p-error">{{ errors.dates }}</small>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <pv-button label="Cancel" icon="pi pi-times" class="p-button-text" @click="cancelCreate" />
        <pv-button label="Create" icon="pi pi-check" @click="createTask" />
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