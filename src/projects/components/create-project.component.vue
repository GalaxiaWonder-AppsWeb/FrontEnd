<script>
import {Button as PvButton, InputText as PvInputText} from "primevue";
import {Project} from "../model/project.entity.js";
import {Person} from "../../iam/model/person.entity.js";
import {ProjectStatus} from "../model/project-status.js";
import {projectService, ProjectService} from "../services/project.service.js";
import {ProjectMember} from "../model/project-member.entity.js";
import {Schedule} from "../model/schedule.entity.js";
export default {
  name: "CreateProject",
  components: {PvButton, PvInputText},
  emits: ['project-created'],
  data() {
    return {
      user: '',
      visible: false,
      form: {
        name: '',
        description: '',
        contractingEmail: '',
      }
    }
  },
  methods: {
    async CreateProject() {
      try {
        const proj = new Project( {
          name: document.getElementById('legalName')?.value,
          description: document.getElementById('description'),
          status: ProjectStatus.BASIC_STUDIES,
          endingDate: document.getElementById('endingDate'),
          schedule: new Schedule(document.getElementById('schedule')?.value),
          budget: document.getElementById('budget'),
        })
        this.visible = false
        const res = await projectService.create.create(org)
        this.projectId = proj.id
        this.message = `Created: ${res.name}`
        this.$emit('project-created', this.projectId)
      } catch (error) {
        this.message = error.message
      }
    },
    onlyNumbers(event) {
      const value = event.target.value
      const numeric = value.replace(/\D/g, '')
      event.target.value = numeric
    }
  },
  created() {
    this.user = JSON.parse(localStorage.getItem("user"))
  },
  computed: {
    isFormValid() {
      return (
          this.form.name.trim() !== '' &&
          this.form.description.trim() !== '' &&
          this.form.contractingEmail.trim() !== ''
      )
    }
  }
};

</script>

<template>
  <div class="card flex justify-center">
    <pv-button :label="$t('organization.create-organization.title')" @click="visible = true" />

    <pv-dialog v-model:visible="visible" modal :header="$t('organization.create-organization.title')" :style="{ width: '30rem' }">

      <span class="dialog-header-text">
        {{ $t('organization.create-organization.information.title') }}
      </span>

      <div class="form-group">
        <label for="legalName">{{ $t('organization.create-organization.information.legal-name') }}</label>
        <pv-input-text id="legalName" v-model="form.name" class="flex-auto" autocomplete="off" />
      </div>

      <div class="form-group">
        <label for="commercialName">{{ $t('organization.create-organization.information.commercial-name') }}</label>
        <pv-input-text id="commercialName" v-model="form.description" class="flex-auto" autocomplete="off" />
      </div>

      <div class="form-group">
        <label for="ruc">{{ $t('organization.create-organization.information.ruc') }}</label>
        <pv-input-text id="ruc" v-model="form.contractingEmail" class="flex-auto" autocomplete="off" maxlength="11" @input="onlyNumbers($event)" />
      </div>

      <div class="dialog-actions">
        <pv-button type="button" :label="$t('organization.create-organization.information.cancel')" severity="secondary" @click="visible = false" />
        <pv-button
            type="button"
            :label="$t('organization.create-organization.information.create')"
            :disabled="!isFormValid"
            @click="CreateProject()"
        />
      </div>
    </pv-dialog>
  </div>

</template>

<style scoped>
.form-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: 600;
  width: 8rem;
  color: #000000;
}


.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.dialog-header-text {
  color: #ccc;
  margin-bottom: 1.5rem;
}
</style>