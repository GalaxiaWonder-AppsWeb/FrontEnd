<template>
  <pv-dialog
      :visible="visible"
      @update:visible="close"
      :modal="true"
      :header="$t('tasks.edit-task.title')"
      style="width: 32rem"
  >
    <form @submit.prevent="handleEdit" class="flex flex-col gap-4">
      <div class="p-field mb-4">
        <label>{{ $t('tasks.edit-task.name') }}</label>
        <pv-input-text v-model="task.name" required :class="{ 'p-invalid': errors.name }" />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>
      <div class="p-field mb-4">
        <label>{{ $t('tasks.edit-task.description') }}</label>
        <pv-input-text v-model="task.description" rows="3" required :class="{ 'p-invalid': errors.description }" />
        <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
      </div>
      <div class="p-field mb-4">
        <label> {{$t('tasks.edit-task.responsible')}} </label>
        <pv-select
            v-model="task.personId"
            :options="members"
            optionLabel="fullName"
            optionValue="personId"
            :placeholder="$t('tasks.edit-task.responsible-placeholder')"
            :showClear="true"
        />
        <pv-checkbox v-model="removePerson" label="Remover responsable" />
        <small class="p-info">{{ $t('tasks.edit-task.responsible-optional') }}</small>
      </div>
      <div class="p-field p-d-flex gap-2 mb-4">
        <div>
          <label>{{ $t('tasks.edit-task.start-date') }}</label>
          <pv-date-picker v-model="task.startDate" required showIcon />
        </div>
        <div>
          <label>{{ $t('tasks.edit-task.end-date') }}</label>
          <pv-date-picker v-model="task.endDate" required showIcon :minDate="task.startDate" />
        </div>
      </div>
      <div class="p-d-flex p-jc-end gap-2 mt-4 mb-4">
        <pv-button type="button" :label="$t('tasks.edit-task.cancel')" @click="close" class="p-button-text" />
        <pv-button type="submit" :label="$t('tasks.edit-task.save')" icon="pi pi-check" :loading="loading" />
      </div>
      <small v-if="error" class="p-error">{{ error }}</small>
    </form>
  </pv-dialog>
</template>

<script>
import { taskService } from '../services/task.service.js'
import { projectTeamMemberService } from '../services/project-team-member.service.js'
import { Specialty } from "../model/specialty.js";
import { TaskStatus } from "../model/task-status.js";

export default {
  name: 'EditTask',
  props: {
    visible: Boolean,
    taskToEdit: { type: Object, required: true }, // La tarea original
    milestoneId: { type: [Number, String], required: true },
    projectId: { type: [Number, String], required: true }
  },
  data() {
    return {
      task: {
        name: '',
        description: '',
        specialty: '',
        personId: null,
        startDate: null,
        endDate: null,
        status: ''
      },
      members: [],
      specialtyOptions: Object.entries(Specialty).map(([key, value]) => ({
        label: key.charAt(0) + key.slice(1).toLowerCase(),
        value
      })),
      loading: false,
      errors: {},
      error: '',
      removePerson: false
    }
  },
  created() {
    console.log('[DEBUG] created - projectId12:', this.projectId)
  },
  watch: {
    visible(val) {
      if (val) {
        this.resetForm();
        this.loadMembers();
      }
    },
    taskToEdit: {
      immediate: true,
      handler(newTask) {
        if (newTask) {
          // Copia profunda para editar
          this.task = { ...newTask };
          this.removePerson = false;
        }
      }
    }
  },
  mounted() {
    console.log('[DEBUG] mounted - projectIdAMOR:', this.projectId)
    this.loadMembers()
  },
  methods: {
    async loadMembers() {
      try {
        const res = await projectTeamMemberService.getProjectTeamMembersByProjectId({ projectId: this.projectId })
        console.log('[DEBUG] Respuesta de miembros del backend:', res)
        this.members = (res || []).map(m => ({
          personId: m.personId,
          fullName: `${m.firstName} ${m.lastName}` + (m.specialty ? ` (${m.specialty})` : ''),
          specialty: m.specialty
        }))
        console.log('[DEBUG] members procesados para dropdown:', this.members)
      } catch (e) {
        this.error = this.$t ? this.$t('tasks.error_loading_members') : 'Error cargando miembros del proyecto';
      }
    },
    validate() {
      this.errors = {}
      if (!this.task.name) this.errors.name = this.$t ? this.$t('tasks.error_name_required') : 'El nombre es obligatorio';
      if (!this.task.description) this.errors.description = this.$t ? this.$t('tasks.error_description_required') : 'La descripción es obligatoria';
      if (!this.task.startDate || !this.task.endDate) this.errors.dates = this.$t ? this.$t('tasks.error_dates_required') : 'Fechas obligatorias';
      return Object.keys(this.errors).length === 0
    },
    async handleEdit() {
      if (!this.validate()) return;
      this.loading = true;
      try {
        // Payload solo con campos que cambiaron o son requeridos
        const payload = {
          name: this.task.name,
          description: this.task.description,
          specialty: this.task.specialty,
          startDate: this.task.startDate,
          endDate: this.task.endDate,
          milestoneId: Number(this.milestoneId),
          projectId: Number(this.projectId),
        };

        // Status según la lógica de negocio
        if (this.removePerson) {
          payload.removePerson = true;
          payload.status = TaskStatus.DRAFT;
        } else if (this.task.personId) {
          payload.personId = this.task.personId;
          payload.status = TaskStatus.PENDING;
        }

        await taskService.update({ id: this.task.id, ...payload });

        this.$toast.add({
          severity: 'success',
          summary: this.$t ? this.$t('tasks.updated_success') : 'Tarea actualizada',
          life: 2000
        });
        this.$emit('updated');
        this.close();
      } catch (e) {
        this.error = e.message || (this.$t ? this.$t('tasks.updated_error') : 'Error al actualizar la tarea');
      } finally {
        this.loading = false;
      }
    },
    close() {
      this.$emit('update:visible', false);
    },
    resetForm() {
      if (this.taskToEdit) {
        this.task = { ...this.taskToEdit };
      } else {
        this.task = { name: '', description: '', specialty: '', personId: null, startDate: null, endDate: null, status: '' };
      }
      this.removePerson = false;
      this.error = '';
      this.errors = {};
    }
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
.mb-4 {
  margin-bottom: 1rem;
}
.p-field {
  margin-bottom: 1.5rem;
}
</style>
