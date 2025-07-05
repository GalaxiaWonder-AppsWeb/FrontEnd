<template>
  <pv-confirm-dialog />
  <div class="task-list-container">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">{{ $t('tasks.title') }}</h2>
      <pv-button
          :label="$t('tasks.create')"
          icon="pi pi-plus"
          @click="showCreate = true"
      />
    </div>

    <pv-dialog v-model:visible="showCreate" :modal="true"  :style="{width: '40rem'}">
      <create-task-component
          :project-id="projectId"
          :milestone-id="milestoneId"
          :visible="showCreate"
          @created="handleCreated"
          @update:visible="showCreate = false"
      />
    </pv-dialog>


    <div v-if="loading" class="text-center p-4">
      <pv-progress-spinner style="width: 50px; height: 50px;" />
      <div class="mt-2"></div>
    </div>

    <div v-else-if="tasks.length === 0" class="text-gray-500 text-center p-4">
      {{ $t('tasks.no-tasks') }}
    </div>

    <div v-else class="task-list-grid">
      <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          @edit="handleEditTask"
          @delete="handleDelete"
      />
      <EditTask
          v-if="showEditDialog"
          :visible="showEditDialog"
          :task-to-edit="selectedTask"
          :project-id="projectId"
          :milestone-id="milestoneId"
          @update:visible="showEditDialog = false"
          @updated="handleTaskUpdated"
      />

    </div>

  </div>
</template>

<script>
import CreateTaskComponent from './create-task.component.vue'
import TaskCard from "./task-card.component.vue";
import EditTask from "./edit-task.component.vue";
import { taskService } from '../services/task.service.js'

export default {
  name: 'TaskList',
  components: {
    CreateTaskComponent,
    TaskCard,
    EditTask
  },
  props: {
    projectId: { type: [String, Number], required: true },
    milestoneId: { type: [String, Number], required: true }
  },
  data() {
    return {
      tasks: [],
      loading: false,
      error: null,
      showCreate: false,
      showEditDialog: false,
      selectedTask: null,
    }
  },
  created() {
    if (!this.projectId) {
      this.projectId = this.$route.params.projectId
    }
    this.loadTasks()
  },
  watch: {
    milestoneId: {
      handler: 'loadTasks',
      immediate: true
    }
  },
  methods: {
    async handleDelete(task) {
      // Confirmación antes de eliminar
      const self = this
      this.$confirm.require({
        message: this.$t('tasks.confirm_delete') || '¿Deseas eliminar esta tarea?',
        header: this.$t('tasks.confirm_delete_title') || 'Eliminar tarea',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
          try {
            await taskService.delete(task.id)
            await self.loadTasks()
            self.$toast.add({
              severity: 'success',
              summary: this.$t('tasks.deleted_success') || 'Tarea eliminada',
              life: 3000
            })
          } catch (e) {
            self.$toast.add({
              severity: 'error',
              summary: this.$t('tasks.deleted_error') || 'Error al eliminar tarea',
              detail: e.message,
              life: 3000
            })
          } finally {
            self.$confirm.close(); // <--- CIERRA el modal manualmente
          }
        }
      })
    },
    async loadTasks() {
      this.loading = true
      try {
        const response = await taskService.getByMilestoneId({ milestoneId: Number(this.milestoneId) })
        this.tasks = Array.isArray(response) ? response : []
        console.log('Tareas:', this.tasks);
      } catch (e) {
        this.error = e.message || 'Error al cargar tareas'
      } finally {
        this.loading = false
      }
    },
    handleEditTask(task) {
      this.selectedTask = {
        ...task,
        startDate: task.startDate ? new Date(task.startDate) : null,
        endDate: task.endDate ? new Date(task.endDate) : null,
      }
      this.showEditDialog = true;
    },
    async handleTaskUpdated() {
      this.showEditDialog = false
      await this.loadTasks()
      if (this.$toast) {
        this.$toast.add({
          severity: 'success',
          summary: this.$t('tasks.updated_success'),
          life: 3000
        })
      }
    },
    async handleCreated() {
      this.showCreate = false
      await this.loadTasks()
      if (this.$toast) {
        this.$toast.add({
          severity: 'success',
          summary: this.$t('tasks.created_success'),
          life: 3000
        })
      }
    }
  }
}
</script>


<style scoped>
.task-list-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}
.task-card {
  background: #232326;
  color: #fff;
  border-radius: 1rem;
  box-shadow: 0 1px 8px rgba(0,0,0,0.10);
  padding: 1rem 1.5rem;
}
</style>
