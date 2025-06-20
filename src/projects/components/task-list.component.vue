<script setup>
import { ref, onMounted, reactive } from 'vue';
import { taskService } from '../services/task.service.js';
import { Task } from '../model/task.entity.js';
import { TaskStatus } from '../model/task-status.js';
import { Specialty } from '../model/specialty.js';
import TaskCard from './task-card.component.vue';
import EditTaskComponent from './edit-task.component.vue';
import AssignResponsibleComponent from './assign-responsible.component.vue';
import CreateTaskComponent from './create-task.component.vue';

const props = defineProps({
  milestoneId: {
    type: Number,
    required: true
  }
});

// Data
const tasks = ref([]);
const loading = ref(false);
const error = ref(null);
const successMessage = ref('');

// Modal states
const editTaskDialog = ref(false);
const createTaskDialog = ref(false);
const deleteTaskDialog = ref(false);
const assignResponsibleDialog = ref(false);

// Selected task for operations
const selectedTask = ref(null);

// Load tasks
const loadTasks = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await taskService.getByMilestoneId(props.milestoneId);
    
    // Get current user info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = user.activeProjectRole;
    const memberId = user.memberId;
    
    // For all roles, all tasks are visible
    tasks.value = response;
    // But we can highlight tasks assigned to the current user if they're a Worker/Specialist
    if (userRole === 'Specialist' && memberId) {
      for (const task of tasks.value) {
        if (task.responsible === Number(memberId) || task.responsible === memberId) {
          task.isAssignedToMe = true;
          }
      }
    }
  } catch (err) {
    console.error('Error loading tasks:', err);
    error.value = 'Failed to load tasks. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Add new task
const addTask = () => {
  createTaskDialog.value = true;
};

// Edit task
const editTask = (task) => {
  selectedTask.value = task;
  editTaskDialog.value = true;
};

// Delete task
const deleteTask = (task) => {
  selectedTask.value = task;
  deleteTaskDialog.value = true;
};

// Confirm delete task
const confirmDeleteTask = async () => {
  try {
    loading.value = true;
    await taskService.delete(selectedTask.value.id);
    await loadTasks();
    deleteTaskDialog.value = false;
    selectedTask.value = null;
  } catch (err) {
    console.error('Error deleting task:', err);
    error.value = 'Failed to delete task. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Open assign responsible dialog
const openAssignResponsible = (task) => {
  selectedTask.value = task;
  assignResponsibleDialog.value = true;
};

// Save task (create or update)
const saveTask = async (task) => {
  try {
    loading.value = true;
    if (task.id) {
      // Modificado para pasar solo el objeto task que ya contiene el id
      await taskService.update(task);
    } else {
      await taskService.create(task);
    }
    await loadTasks();
    editTaskDialog.value = false;
    selectedTask.value = null;
  } catch (err) {
    console.error('Error saving task:', err);
    error.value = 'Failed to save task. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Assign responsible
const assignResponsible = async (memberId) => {
  if (!selectedTask.value || !selectedTask.value.id || !memberId) {
    error.value = 'No se pudo asignar el responsable. Datos inválidos.';
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    // Usar el método especializado del servicio
    await taskService.assignResponsible(selectedTask.value.id, memberId);
    
    // Mostrar mensaje de éxito
    successMessage.value = 'Tarea asignada correctamente. Estado actualizado a PENDIENTE.';
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);

    // Recargar tareas para reflejar los cambios
    await loadTasks();
    assignResponsibleDialog.value = false;
    selectedTask.value = null;
  } catch (err) {
    console.error('Error assigning responsible:', err);
    error.value = 'No se pudo asignar el responsable. Por favor, intente nuevamente.';
  } finally {
    loading.value = false;
  }
};

// Create task from CreateTaskComponent
const createTask = async (task) => {
  try {
    loading.value = true;
    // Asegurarnos de asignar el milestoneId correcto
    const taskWithMilestoneId = {
      ...task,
      milestoneId: props.milestoneId
    };
    
    await taskService.create(taskWithMilestoneId);
    await loadTasks();
    createTaskDialog.value = false;
  } catch (err) {
    console.error('Error creating task:', err);
    error.value = 'Failed to create task. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Close modals
const closeModals = () => {
  editTaskDialog.value = false;
  createTaskDialog.value = false;
  deleteTaskDialog.value = false;
  assignResponsibleDialog.value = false;
  selectedTask.value = null;
};

// Load tasks on component mount
onMounted(loadTasks);
</script>

<template>
  <div class="task-list-container">
    <div class="header">
      <h2>Tasks</h2>
      <pv-button 
        icon="pi pi-plus" 
        label="Add Task" 
        class="add-task-btn" 
        @click="addTask"
      />
    </div>

    <!-- Mostrar mensaje de éxito si existe -->
    <pv-message v-if="successMessage" severity="success" :closable="true" @close="successMessage = ''">
      {{ successMessage }}
    </pv-message>
    
    <div v-if="loading" class="loading">
      <pv-progress-spinner />
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <pv-button label="Retry" icon="pi pi-refresh" @click="loadTasks" />
    </div>
    
    <div v-else-if="tasks.length === 0" class="empty-state">
      <p>No tasks available. Click "Add Task" to create one.</p>
    </div>

    <div v-else class="task-grid">
      <task-card 
        v-for="task in tasks" 
        :key="task.id" 
        :task="task"
        @edit="editTask"
        @delete="deleteTask"
        @assign="openAssignResponsible"
      />
    </div>    <!-- Create Task Dialog -->
    <create-task-component
      v-model:visible="createTaskDialog"
      :milestone-id="props.milestoneId"
      @create="createTask"
      @cancel="closeModals"
    />

    <!-- Edit Task Dialog -->
    <edit-task-component
      v-if="editTaskDialog"
      v-model:visible="editTaskDialog"
      :task="selectedTask"
      @save="saveTask"
      @cancel="closeModals"
    />

    <!-- Delete Confirmation Dialog -->
    <pv-dialog 
      v-model:visible="deleteTaskDialog" 
      header="Confirm Delete" 
      :modal="true"
      :closable="false"
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--yellow-700)"></i>
        <span>Are you sure you want to delete this task?</span>
      </div>
      <template #footer>
        <pv-button label="No" icon="pi pi-times" class="p-button-text" @click="closeModals" />
        <pv-button label="Yes" icon="pi pi-check" class="p-button-danger" @click="confirmDeleteTask" />
      </template>
    </pv-dialog>

    <!-- Assign Responsible Dialog -->
    <assign-responsible-component
      v-if="assignResponsibleDialog"
      v-model:visible="assignResponsibleDialog"
      :task="selectedTask"
      @assign="assignResponsible"
      @cancel="closeModals"
    />
  </div>
</template>

<style scoped>
.task-list-container {
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.loading, .error, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
</style>