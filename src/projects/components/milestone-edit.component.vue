<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { Milestone } from '../model/milestone.entity.js';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  milestone: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:visible', 'save', 'cancel']);

// Form data
const formData = reactive({
  id: null,
  name: '',
  description: '',
  startDate: null,
  endDate: null
});

// Form validation
const errors = reactive({
  name: null,
  description: null,
  dates: null
});

// Initialize form data when milestone changes
watch(() => props.milestone, (newMilestone) => {
  if (newMilestone) {
    formData.id = newMilestone.id;
    formData.name = newMilestone.name;
    formData.description = newMilestone.description;
    
    // Handle date values carefully
    try {
      formData.startDate = newMilestone.startDate instanceof Date 
        ? new Date(newMilestone.startDate) 
        : new Date(newMilestone.startDate);
      
      formData.endDate = newMilestone.endDate instanceof Date 
        ? new Date(newMilestone.endDate) 
        : new Date(newMilestone.endDate);
        
      } catch (error) {
      console.error('Error parsing milestone dates:', error);
    }
  }
}, { immediate: true });

// Computed property to check if it's a new milestone or editing existing one
const isNewMilestone = computed(() => {
  return !formData.id;
});

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

// Save milestone
const saveMilestone = () => {
  if (!validateForm()) {
    console.warn('Form validation failed');
    return;
  }
  
  try {    // Create a new milestone entity with the form data
    const milestone = new Milestone({
      id: formData.id,
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate
    });
    
    // Send the milestone entity back to the parent component
    emit('save', milestone);
  } catch (error) {
    console.error('Error creating milestone entity:', error);
    // Handle specific validation errors from the Milestone entity if needed
  }
};

// Cancel and close dialog
const cancel = () => {
  emit('cancel');
};

// Update visible property
const updateVisible = (value) => {
  emit('update:visible', value);
};

// Min date for end date (can't be before start date)
const minEndDate = computed(() => {
  return formData.startDate || new Date();
});
</script>

<template>
  <pv-dialog 
    :visible="visible" 
    @update:visible="updateVisible"
    :modal="true"
    :closable="false"
    :style="{ width: '500px' }"
    :header="$t('schedule.edit-milestone.title')"
  >
    <div class="form-container">
      <div class="form-field">
        <label for="name">{{ $t('schedule.edit-milestone.name') }}</label>
        <pv-input-text
          id="name"
          v-model="formData.name"
          class="w-full"
          :class="{ 'p-invalid': errors.name }"
          autofocus
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>

        <label for="name">{{ $t('schedule.edit-milestone.description') }}</label>
        <pv-input-text
            id="name"
            v-model="formData.description"
            class="w-full"
            :class="{ 'p-invalid': errors.description }"
            autofocus
        />
        <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
      </div>
      
      <div class="form-dates">
        <div class="form-field">
          <label for="startDate">{{ $t('schedule.edit-milestone.start-date') }}</label>
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
          <label for="endDate">{{ $t('schedule.edit-milestone.end-date') }}</label>
          <pv-date-picker 
            id="endDate" 
            v-model="formData.endDate" 
            dateFormat="dd/mm/yy" 
            showIcon 
            class="w-full" 
            :class="{ 'p-invalid': errors.dates }"
            :minDate="minEndDate"
          />
        </div>
      </div>
      <small v-if="errors.dates" class="p-error">{{ errors.dates }}</small>
      
      <div class="form-info">
        <i class="pi pi-info-circle"></i>
        <small>
          {{ $t('schedule.edit-milestone.key-point') }}
        </small>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <pv-button :label="$t('schedule.edit-milestone.cancel')" icon="pi pi-times" class="p-button-text" @click="cancel" />
        <pv-button :label="$t('schedule.edit-milestone.save')" icon="pi pi-check" @click="saveMilestone" />
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