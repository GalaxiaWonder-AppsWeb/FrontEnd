<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { Task } from '../model/task.entity.js';
import { TaskStatus } from '../model/task-status.js';
import { Specialty } from '../model/specialty.js';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  task: {
    type: Object,
    required: true
  }
});


const emit = defineEmits(['update:visible', 'save', 'cancel']);

// Form data
const formData = reactive({
  id: null,
  name: '',
  specialty: null,
  status: null,
  startingDate: null,
  dueDate: null,
  responsible: null
});

// Form validation
const errors = reactive({
  name: null,
  specialty: null,
  dates: null
});

// Initialize form data when task changes
watch(() => props.task, (newTask) => {
  if (newTask) {
    formData.id = newTask.id;
    formData.name = newTask.name;
    formData.specialty = newTask.specialty;
    formData.status = newTask.status;
    formData.startingDate = newTask.startingDate instanceof Date 
      ? new Date(newTask.startingDate) 
      : new Date(newTask.startingDate);
    formData.dueDate = newTask.dueDate instanceof Date 
      ? new Date(newTask.dueDate) 
      : new Date(newTask.dueDate);
    formData.responsible = newTask.responsible;
  }
}, { immediate: true });

// Available options for specialty and status
const specialties = computed(() => 
  Object.entries(Specialty).map(([key, value]) => ({ label: value, value }))
);

const statuses = computed(() => 
  Object.entries(TaskStatus).map(([key, value]) => ({ label: value, value }))
);

// Validate the form
const validateForm = () => {
  let valid = true;
  
  // Validate name
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Task name is required';
    valid = false;
  } else {
    errors.name = null;
  }
  
  // Validate specialty
  if (!formData.specialty) {
    errors.specialty = 'Please select a specialty';
    valid = false;
  } else {
    errors.specialty = null;
  }
  
  // Validate dates
  if (!formData.startingDate || !formData.dueDate) {
    errors.dates = 'Both start and due dates are required';
    valid = false;
  } else if (formData.dueDate < formData.startingDate) {
    errors.dates = 'Due date cannot be earlier than start date';
    valid = false;
  } else {
    errors.dates = null;
  }
  
  return valid;
};

// Handle save button click
const handleSave = () => {
  if (!validateForm()) return;
  
  try {
    const task = new Task({
      id: formData.id,
      name: formData.name,
      specialty: formData.specialty,
      status: formData.status || TaskStatus.DRAFT,
      startingDate: formData.startingDate,
      dueDate: formData.dueDate,
      responsible: formData.responsible || 0, // This is temporary until we implement the assign responsible
      milestoneId: props.task.milestoneId || 0 // Assuming task has a milestoneId
    });
    
    emit('save', task);
  } catch (error) {
    console.error('Error creating task:', error);
    // Handle specific validation errors if needed
  }
};

// Close the dialog
const handleCancel = () => {
  emit('cancel');
};

// Update visibility
const updateVisible = (value) => {
  emit('update:visible', value);
};
</script>

<template>
  <pv-dialog 
    :visible="visible" 
    @update:visible="updateVisible"
    :modal="true"
    :closable="false"
    :style="{ width: '500px' }"
    :header="task.id ? 'Edit Task' : 'Create New Task'"
  >
    <div class="form-container">
      <div class="form-field">
        <label for="name">Task Name*</label>
        <pv-input-text 
          id="name" 
          v-model="formData.name" 
          :class="{ 'p-invalid': errors.name }"
          class="w-full" 
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>
        <div class="form-field">
        <label for="specialty">Specialty*</label>
        <pv-select 
          id="specialty" 
          v-model="formData.specialty" 
          :options="specialties" 
          optionLabel="label" 
          optionValue="value"
          :class="{ 'p-invalid': errors.specialty }"
          class="w-full" 
        />
        <small v-if="errors.specialty" class="p-error">{{ errors.specialty }}</small>
      </div>
        <div class="form-field" v-if="task.id">
        <label for="status">Status</label>
        <pv-select 
          id="status" 
          v-model="formData.status" 
          :options="statuses" 
          optionLabel="label" 
          optionValue="value"
          class="w-full" 
        />
      </div>
      
      <div class="dates-container">
        <div class="form-field">
          <label for="startingDate">Start Date*</label>
          <pv-date-picker 
            id="startingDate" 
            v-model="formData.startingDate" 
            :showIcon="true"
            :class="{ 'p-invalid': errors.dates }"
            class="w-full"
            dateFormat="dd/mm/yy"
          />
        </div>
        
        <div class="form-field">
          <label for="dueDate">Due Date*</label>
          <pv-date-picker 
            id="dueDate" 
            v-model="formData.dueDate" 
            :showIcon="true"
            :class="{ 'p-invalid': errors.dates }"
            class="w-full"
            dateFormat="dd/mm/yy"
          />
        </div>
      </div>
      <small v-if="errors.dates" class="p-error">{{ errors.dates }}</small>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <pv-button label="Cancel" icon="pi pi-times" class="p-button-text" @click="handleCancel" />
        <pv-button label="Save" icon="pi pi-check" @click="handleSave" />
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dates-container {
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