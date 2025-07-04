<template>
  <pv-dialog
      :visible="visible"
      @update:visible="close"
      :modal="true"
      :header="$t('tasks.create-task.title')"
      style="width: 32rem"
  >
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <div class="p-field mb-4">
        <label>{{ $t('tasks.create-task.title') }}</label>
        <pv-input-text v-model="task.name" required :class="{ 'p-invalid': errors.name }" />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>
      <div class="p-field mb-4">
        <label>{{ $t('tasks.create-task.description') }}</label>
        <pv-input-text v-model="task.description" rows="3" required :class="{ 'p-invalid': errors.description }" />
        <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
      </div>
      <div class="p-field mb-4">
        <label>{{ $t('tasks.create-task.budget') }}</label>
        <pv-input-text v-model="task.amount" rows="3" required :class="{ 'p-invalid': errors.amount }" />
        <small v-if="errors.amount" class="p-error">{{ errors.amount }}</small>
      </div>
      <div class="p-field mb-4">
        <label>{{ $t('tasks.create-task.specialty') }}</label>
        <pv-select
            v-model="task.specialty"
            :options="specialtyOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('tasks.create-task.specialty-placeholder')"
        />
      </div>
      <div class="p-field mb-4">
        <label>{{ $t('tasks.create-task.responsible') }}</label>
        <pv-select
            v-model="task.personId"
            :options="filteredMembers"
            optionLabel="fullName"
            optionValue="personId"
            :placeholder="$t('tasks.create-task.responsible-placeholder')"
            :showClear="true"
        />
        <small class="p-info">{{ $t('tasks.create-task.responsible-optional') }}</small>
      </div>
      <div class="p-field p-d-flex gap-2 mb-4">
        <div>
          <label>{{ $t('tasks.create-task.start-date') }}</label>
          <pv-date-picker v-model="task.startDate" required showIcon />
        </div>
        <div>
          <label>{{ $t('tasks.create-task.end-date') }}</label>
          <pv-date-picker v-model="task.endDate" required showIcon :minDate="task.startDate" />
        </div>
      </div>
      <div class="p-d-flex p-jc-end gap-2 mt-4 mb-4">
        <pv-button type="button" :label="$t('tasks.create-task.cancel')" @click="close" class="p-button-text" />
        <pv-button type="submit" :label="$t('tasks.create-task.create')" icon="pi pi-check" :loading="loading" />
      </div>
      <small v-if="error" class="p-error">{{ error }}</small>
    </form>
  </pv-dialog>
</template>

<script>
import { taskService } from '../services/task.service.js'
import { projectTeamMemberService } from '../services/project-team-member.service.js'
import { Specialty } from "../model/specialty.js";
import { TaskStatus} from "../model/task-status.js";
import {Task} from "../model/task.entity.js";

export default {
  name: 'CreateTask',
  props: {
    visible: Boolean,
    milestoneId: { type: [Number, String], required: true },
    projectId: { type: [Number, String], required: true }
  },
  data() {
    return {
      task: {
        name: '',
        description: '',
        specialty: '',
        amount: null,
        personId: null,
        startDate: null,
        endDate: null
      },
      members: [],
      specialtyOptions: Object.entries(Specialty).map(([key, value]) => ({
        label: key.charAt(0) + key.slice(1).toLowerCase(), // O usa $t('specialty.'+key) si tienes traducción
        value
      })),
      loading: false,
      errors: {},
      error: ''
    }
  },
  computed: {
    filteredMembers() {
      if (!this.task.specialty) return this.members
      // Filtra miembros cuya especialidad coincida
      return this.members.filter(m =>
          m.specialty && m.specialty.toLowerCase() === this.task.specialty.toLowerCase()
      )
    }
  },
  watch: {
    visible(val) {
      console.log('[DEBUG] Watcher visible:', val)
      if (val) {
        this.resetForm()
        this.loadMembers()
      }
    }
  },
  mounted() {
    console.log('[DEBUG] mounted - projectId:', this.projectId)
    this.loadMembers()
  },
  methods: {
    async loadMembers() {
      try {
        console.log('[DEBUG] projectId:', this.projectId)
        const res = await projectTeamMemberService.getProjectTeamMembersByProjectId({ projectId: this.projectId })
        console.log('[DEBUG] Respuesta de miembros del backend:', res)
        // Transforma la data a lo que necesitas para el dropdown
        this.members = (res || []).map(m => ({
          personId: m.personId,
          fullName: `${m.firstName} ${m.lastName}` + (m.specialty ? ` (${m.specialty})` : ''),
          specialty: m.specialty
        }))
        console.log('[DEBUG] members procesados para dropdown:', this.members)
      } catch (e) {
        this.error = 'Error cargando miembros del proyecto'
      }
    },
    validate() {
      this.errors = {}
      if (!this.task.name) this.errors.name = 'El nombre es obligatorio'
      if (!this.task.description) this.errors.description = 'La descripción es obligatoria'
      if (!this.task.specialty) this.errors.specialty = 'Selecciona una especialidad'
      if (!this.task.startDate || !this.task.endDate) this.errors.dates = 'Fechas obligatorias'
      return Object.keys(this.errors).length === 0
    },
    async handleSubmit() {
      let status = TaskStatus.DRAFT
      if (this.task.personId) status = TaskStatus.PENDING
      if (!this.validate()) return
      this.loading = true
      try {
        await taskService.create({
          ...this.task,
          milestoneId: Number(this.milestoneId),
          projectId: Number(this.projectId),
          amount: Number(this.task.amount),
          status,
          personId: this.task.personId || undefined // permite que vaya vacío
        })
        this.$emit('created')
        this.$toast.add({ severity: 'success', summary: 'Tarea creada', life: 2000 })
        this.close()
      } catch (e) {
        this.error = e.message || 'Error al crear la tarea'
      } finally {
        this.loading = false
      }
    },
    close() {
      this.$emit('update:visible', false)
    },
    resetForm() {
      this.task = { name: '', description: '', specialty: '', personId: null, startDate: null, endDate: null }
      this.error = ''
      this.errors = {}
    }
  },
  created() {
    console.log('[DEBUG] created - projectId:', this.projectId)
    if (!this.projectId) {
      console.warn('[CreateTaskComponent] projectId no recibido o es undefined');
    }
  },
}
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
.mt-4 {
  margin-top: 1rem;
}

.p-field {
  margin-bottom: 1.5rem;

}
</style>
