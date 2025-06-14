<script setup>
import { ref, onMounted, computed } from 'vue';
import { milestoneService } from '../services/milestone.service.js';
import { MilestoneAssembler } from '../services/milestone.assembler.js';
import { Milestone } from '../model/milestone.entity.js';
import MilestoneCard from './milestone-card.component.vue';
import MilestoneEdit from './milestone-edit.component.vue';
import TaskList from './task-list.component.vue';

const props = defineProps({
  projectId: {
    type: [Number, String], // Aceptar tanto número como cadena
    required: true,
    validator: (value) => {
      // Validar que sea un número o una cadena que se puede convertir a número
      return value !== undefined && value !== null && !isNaN(Number(value));
    }
  }
});

// Data
const milestones = ref([]);
const loading = ref(false);
const error = ref(null);
const selectedMilestone = ref(null);

// Dialog states
const editDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const viewTasksDialogVisible = ref(false);

// Load milestones - exposed to parent components
const loadMilestones = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Get the API base URL from environment
    const apiBaseUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';    // Convertir projectId a número si es posible
    const projectIdInput = props.projectId;
    console.log('Project ID input:', projectIdInput, 'Type:', typeof projectIdInput);
    
    // Intentamos convertir a número si no es ya un número
    const projectId = typeof projectIdInput === 'number' ? projectIdInput : Number(projectIdInput);
    
    console.log('Project ID after conversion:', projectId, 'Type:', typeof projectId, 'Is NaN:', isNaN(projectId));
    
    // Verificar si es un valor numérico válido
    if (projectId === null || projectId === undefined || isNaN(projectId)) {
      console.error('Error: Invalid or missing project ID:', projectIdInput);
      error.value = 'Missing or invalid project ID. Please select a valid project.';
      loading.value = false;
      return;
    }
      // Use direct fetch call to ensure correct URL formatting
    console.log(`Fetching milestones for project ID: ${projectId} (type: ${typeof projectId})`);
    // JSON Server syntax for filtering by a field
    const url = `${apiBaseUrl}/milestones?projectId=${projectId}`;
    console.log(`Request URL: ${url}`);
    
    // Make the direct API call
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Milestones data received:', data);
    
    // Convert to entities
    milestones.value = MilestoneAssembler.toEntitiesFromResponse(data);
    console.log('Converted milestone entities:', milestones.value);
  } catch (err) {
    console.error('Error loading milestones:', err);
    error.value = 'Failed to load milestones. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Expose the loadMilestones method to parent components
defineExpose({
  loadMilestones
});

// Create new milestone
const createMilestone = () => {
  // Create a new milestone with default values
  selectedMilestone.value = new Milestone({
    name: 'New Milestone',
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    items: []
  });
  
  editDialogVisible.value = true;
};

// Edit milestone
const editMilestone = (milestone) => {
  console.log('editMilestone called with:', milestone);
  selectedMilestone.value = milestone;
  console.log('selectedMilestone set to:', selectedMilestone.value);
  editDialogVisible.value = true;
  console.log('editDialogVisible set to:', editDialogVisible.value);
};

// Delete milestone
const deleteMilestone = (milestone) => {
  selectedMilestone.value = milestone;
  deleteDialogVisible.value = true;
};

// Confirm milestone deletion
const confirmDeleteMilestone = async () => {
  try {
    loading.value = true;
    
    // Get the API base URL from environment
    const apiBaseUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
      // Parse the ID to ensure it's a number if it's stored as a string
    let milestoneId = selectedMilestone.value.id;
    if (typeof milestoneId === 'string' && !isNaN(Number(milestoneId))) {
      milestoneId = Number(milestoneId);
    }
    
    // Use direct API call for deleting milestone
    const url = `${apiBaseUrl}/milestones/${milestoneId}`;
    console.log(`Deleting milestone at URL: ${url} with ID type: ${typeof milestoneId}`);
    
    const response = await fetch(url, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    await loadMilestones();
    deleteDialogVisible.value = false;
  } catch (err) {
    console.error('Error deleting milestone:', err);
    error.value = 'Failed to delete milestone. Please try again.';
  } finally {
    loading.value = false;
    selectedMilestone.value = null;
  }
};

// Save milestone (create or update)
const saveMilestone = async (milestone) => {
  try {
    loading.value = true;    // Format dates properly and ensure all required fields are included with proper types
    // Parse id to numeric if it's a string
    let milestoneId = milestone.id;
    if (typeof milestoneId === 'string' && !isNaN(Number(milestoneId))) {
      milestoneId = Number(milestoneId);
    }
    
    // Ensure projectId is numeric
    let projectId = milestone.projectId || props.projectId;
    if (typeof projectId === 'string' && !isNaN(Number(projectId))) {
      projectId = Number(projectId);
    }
    
    console.log(`Processing milestone with ID: ${milestoneId} (type: ${typeof milestoneId}) and projectId: ${projectId} (type: ${typeof projectId})`);
    
    const milestoneData = {
      id: milestoneId,
      name: milestone.name,
      projectId: projectId,
      startDate: milestone.startDate instanceof Date 
        ? milestone.startDate.toISOString() 
        : new Date(milestone.startDate).toISOString(),
      endDate: milestone.endDate instanceof Date 
        ? milestone.endDate.toISOString() 
        : new Date(milestone.endDate).toISOString(),
      startingDate: milestone.startDate instanceof Date 
        ? milestone.startDate.toISOString() 
        : new Date(milestone.startDate).toISOString(),
      endingDate: milestone.endDate instanceof Date 
        ? milestone.endDate.toISOString() 
        : new Date(milestone.endDate).toISOString(),
      items: milestone.items || []
    };
    
    // Get the API base URL from environment
    const apiBaseUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
      // Determine if this is an update or create operation
    if (milestoneId) {      
      // Update existing milestone - use the parsed numeric ID
      const url = `${apiBaseUrl}/milestones/${milestoneId}`;
      console.log(`Updating milestone at URL: ${url} with ID type: ${typeof milestoneId}`, milestoneData);
      
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(milestoneData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`API call failed with status: ${response.status}. Details: ${errorText}`);
        }
        
        const updatedData = await response.json();
        console.log('Milestone successfully updated:', updatedData);
      } catch (error) {
        console.error('Error during milestone update:', error);
        throw error;
      }
    } else {
      // Create new milestone
      const url = `${apiBaseUrl}/milestones`;
      console.log(`Creating milestone at URL: ${url}`, milestoneData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(milestoneData)
      });
      
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
    }
    
    await loadMilestones();
    editDialogVisible.value = false;
  } catch (err) {
    console.error('Error saving milestone:', err);
    error.value = 'Failed to save milestone. Please try again.';
  } finally {
    loading.value = false;
    selectedMilestone.value = null;
  }
};

// View tasks for a milestone
const viewTasks = (milestone) => {
  selectedMilestone.value = milestone;
  viewTasksDialogVisible.value = true;
};

// Close all dialogs
const closeDialogs = () => {
  editDialogVisible.value = false;
  deleteDialogVisible.value = false;
  viewTasksDialogVisible.value = false;
  selectedMilestone.value = null;
};

// Load milestones when component is mounted
onMounted(loadMilestones);
</script>

<template>
  <div class="milestone-list-container">

    <div v-if="loading" class="loading-container">
      <pv-progress-spinner />
      <span>Loading milestones...</span>
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <pv-button label="Retry" icon="pi pi-refresh" @click="loadMilestones" />
    </div>

    <div v-else-if="milestones.length === 0" class="empty-container">
      <p>No milestones found. Click "Add Milestone" to create one.</p>
    </div>

    <div v-else class="milestone-grid">
      <milestone-card
        v-for="milestone in milestones"
        :key="milestone.id"
        :milestone="milestone"
        @edit="editMilestone"
        @delete="deleteMilestone"
        @view-tasks="viewTasks"
      />
    </div>

    <!-- Edit Milestone Dialog -->
    <milestone-edit
      v-if="editDialogVisible"
      v-model:visible="editDialogVisible"
      :milestone="selectedMilestone"
      @save="saveMilestone"
      @cancel="closeDialogs"
    />

    <!-- Delete Confirmation Dialog -->
    <pv-dialog
      v-model:visible="deleteDialogVisible"
      header="Confirm Delete"
      :modal="true"
      :closable="false"
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--yellow-700)"></i>
        <span>
          Are you sure you want to delete this milestone? This will also delete all associated tasks.
        </span>
      </div>
      <template #footer>
        <pv-button label="No" icon="pi pi-times" class="p-button-text" @click="closeDialogs" />
        <pv-button label="Yes" icon="pi pi-check" class="p-button-danger" @click="confirmDeleteMilestone" />
      </template>
    </pv-dialog>

    <!-- View Tasks Dialog -->
    <pv-dialog
      v-if="viewTasksDialogVisible"
      v-model:visible="viewTasksDialogVisible"
      :header="`Tasks: ${selectedMilestone?.name}`"
      :modal="true"
      :style="{ width: '80vw' }"
      :maximizable="true"
    >
      <div v-if="selectedMilestone" class="tasks-dialog-content">
        <task-list :milestone-id="selectedMilestone.id" />
      </div>
      <template #footer>
        <pv-button label="Close" icon="pi pi-times" class="p-button-text" @click="closeDialogs" />
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>
.milestone-list-container {
  padding: 1rem;
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.milestone-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.error-message {
  color: var(--red-500);
  margin-bottom: 1rem;
}

.confirmation-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
}

.tasks-dialog-content {
  min-height: 400px;
  max-height: 70vh;
  overflow-y: auto;
}
</style>