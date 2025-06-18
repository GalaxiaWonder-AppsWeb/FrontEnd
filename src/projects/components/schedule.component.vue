<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import MilestoneList from './milestone-list.component.vue';
import MilestoneCard from './milestone-card.component.vue';
import TaskList from './task-list.component.vue';
import EditTask from './edit-task.component.vue';
import AssignResponsible from './assign-responsible.component.vue';
import CreateMilestone from './create-milestone.component.vue';
import { milestoneService } from '../services/milestone.service.js';

// Obtener la ruta actual
const route = useRoute();

const props = defineProps({
  projectId: {
    type: Number,
    required: false // Hacemos que no sea requerido ya que lo obtendremos de la ruta
  }
});

// Obtener el projectId de la ruta o de los props
const projectId = computed(() => {
  // Primero intentamos obtener de los props
  if (props.projectId !== undefined && props.projectId !== null) {
    console.log("Using projectId from props:", props.projectId, typeof props.projectId);
    return typeof props.projectId === 'number' ? props.projectId : Number(props.projectId);
  }
  
  // Si no está en los props, intentamos obtenerlo de la ruta
  if (route.params.projectId) {
    const routeProjectId = Number(route.params.projectId);
    console.log("Using projectId from route:", route.params.projectId, typeof routeProjectId);
    return routeProjectId;
  }
  
  console.warn("Could not find valid projectId in props or route");
  return null;
});

// Active tab state
const activeTab = ref('milestones');

// Selected milestone for task view
const selectedMilestoneId = ref(null);
const selectedMilestoneName = ref('');

// View mode for the schedule
const viewMode = ref('list'); // 'list' or 'calendar'

// Create milestone dialog visibility
const createMilestoneDialogVisible = ref(false);
const loading = ref(false);
const error = ref(null);

// Reference to the milestone list component
const milestoneListRef = ref(null);

// Toggle between list and calendar view
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'calendar' : 'list';
};

// Switch to task view for a specific milestone
const viewMilestoneTasks = (milestone) => {
  selectedMilestoneId.value = milestone.id;
  selectedMilestoneName.value = milestone.name;
  activeTab.value = 'tasks';
};

// Go back to milestones view
const backToMilestones = () => {
  activeTab.value = 'milestones';
  selectedMilestoneId.value = null;
  selectedMilestoneName.value = '';
};

// Open create milestone dialog
const openCreateMilestone = () => {
  createMilestoneDialogVisible.value = true;
};

// Handle new milestone creation
const handleCreateMilestone = async (milestone) => {
  try {
    loading.value = true;
    error.value = null;
      // Ensure projectId is a number

    console.log('YA NOSE QUE HACER');
    const projectIdValue = projectId.value;
    console.log('PAPI QUE TU QUIERE,', projectIdValue, typeof projectIdValue);
    const projectIdNumber = typeof projectIdValue === 'number' ? projectIdValue : Number(projectIdValue);
    console.log('MAMI QUE TU QUIERE',projectIdNumber, typeof projectIdNumber);
    // Format dates for API and ensure projectId is included
    const milestoneData = {
      ...milestone,
      projectId: projectIdNumber,
      startingDate: milestone.startDate,
      endingDate: milestone.endDate
    };
    
    // Get the API base URL from environment
    const apiBaseUrl = import.meta.env.VITE_PROPGMS_API_URL || 'http://localhost:3000';
    
    // Use direct API call for creating milestone
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
    
    // Close dialog
    createMilestoneDialogVisible.value = false;
    
    // Refresh the milestone list
    if (activeTab.value === 'milestones') {
      const milestoneListRefValue = milestoneListRef.value;
      if (milestoneListRefValue && typeof milestoneListRefValue.loadMilestones === 'function') {
        milestoneListRefValue.loadMilestones();
      }
    }
  } catch (err) {
    console.error('Error creating milestone:', err);
    error.value = 'Failed to create milestone. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>  <div class="schedule-container">
    <!-- Schedule Header -->
    <div class="schedule-header">
      <div class="header-left">
        <h1 class="schedule-title">Project Schedule</h1>
        
        <!-- Navigation for task view -->
        <div v-if="activeTab === 'tasks'" class="navigation">
          <pv-button 
            icon="pi pi-arrow-left" 
            class="p-button-text" 
            @click="backToMilestones"
            label="Back to Milestones"
          />
          <span class="navigation-separator">|</span>
          <span class="current-milestone">{{ selectedMilestoneName }}</span>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="header-actions">
        <!-- Add milestone button (only on milestones tab) -->
        <pv-button 
          v-if="activeTab === 'milestones'"
          label="Add Milestone" 
          icon="pi pi-plus" 
          @click="openCreateMilestone" 
        />
        
        <!-- View mode toggle 
        <pv-button-set>
          <pv-button 
            icon="pi pi-list" 
            :class="{ 'p-button-outlined': viewMode !== 'list' }" 
            @click="viewMode = 'list'"
            tooltip="List View"
          />
          <pv-button 
            icon="pi pi-calendar" 
            :class="{ 'p-button-outlined': viewMode !== 'calendar' }" 
            @click="viewMode = 'calendar'"
            tooltip="Calendar View"
          />
        </pv-button-set>
        -->
      </div>
    </div>
    
    <!-- Schedule Content -->
    <div class="schedule-content">
      <!-- Milestones Tab -->
      <div v-if="activeTab === 'milestones'" class="milestones-container">        <!-- List View -->        <div v-if="viewMode === 'list'" class="list-view">          <milestone-list 
            ref="milestoneListRef"
            :projectId="projectId"
            @view-tasks="viewMilestoneTasks"
          />
          <!--
          <div v-if="!props.projectId" class="error-message">
            <p>Error: Project ID is undefined. Please make sure to provide a valid project ID.</p>
          </div>
          -->
        </div>
        
        <!-- Calendar View (placeholder, would require additional implementation) -->
        <div v-else class="calendar-view">
          <div class="calendar-placeholder">
            <i class="pi pi-calendar" style="font-size: 3rem; color: var(--primary-color-lighter)"></i>
            <p>Calendar view is under development</p>
            <pv-button 
              label="Switch to List View" 
              icon="pi pi-list" 
              class="p-button-outlined" 
              @click="viewMode = 'list'"
            />
          </div>
        </div>
      </div>
      
      <!-- Tasks Tab -->
      <div v-else-if="activeTab === 'tasks'" class="tasks-container">
        <task-list v-if="selectedMilestoneId" :milestoneId="selectedMilestoneId" />      </div>
    </div>
    
    <!-- Create Milestone Dialog -->    <create-milestone
      v-model:visible="createMilestoneDialogVisible"
      :projectId="projectId"
      @create="handleCreateMilestone"
      @cancel="createMilestoneDialogVisible = false"
    />
    
    <!-- Show error message if there's an error -->
    <pv-toast v-if="error" severity="error" :life="3000" />
  </div>
</template>

<style scoped>
.schedule-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem;
  gap: 1.5rem;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.schedule-title {
  font-size: 1.75rem;
  margin: 0;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.navigation-separator {
  color: var(--text-color-secondary);
}

.current-milestone {
  font-weight: 600;
  color: var(--primary-color);
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.schedule-content {
  flex: 1;
}

.calendar-view {
  height: 100%;
  min-height: 400px;
}

.calendar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  background-color: var(--surface-ground);
  border-radius: 8px;
  padding: 2rem;
}

/* Make sure the content fills the available space */
.milestones-container,
.tasks-container {
  height: 100%;
}
</style>