<template>
  <pv-dialog
      :visible="visible"
      @update:visible="close"
      :modal="true"
      :header="$t('projects.working-team.add-member.title')"
      class="add-project-member-dialog"
  >
    <form @submit.prevent="handleAddMember">
      <!-- Selector de miembro -->
      <div class="p-field">
        <label>{{ $t('projects.working-team.add-member.organization-member') }}</label>
        <pv-select
            v-model="selectedMember"
            :options="members"
            optionLabel="email"
            optionValue="id"
            :placeholder="$t('projects.working-team.add-member.organization-member-placeholder')"
            :disabled="loading"
            required
        />
      </div>

      <!-- Selector de rol -->
      <div class="p-field">
        <label>{{ $t('projects.working-team.add-member.role') }}</label>
        <pv-select
            v-model="selectedRole"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('projects.working-team.add-member.role-placeholder')"
            :disabled="loading"
            required
        />
      </div>

      <!-- Campo de especialidad solo para especialistas -->
      <div class="p-field" v-if="selectedRole === ProjectRole.SPECIALIST">
        <label>{{ $t('projects.working-team.add-member.specialty') }}</label>
        <pv-input-text
            v-model="specialty"
            :placeholder="$t('projects.working-team.add-member.specialty-placeholder')"
            :disabled="loading"
            required
        />
      </div>

      <div class="p-d-flex p-jc-end p-mt-3">
        <pv-button
            type="button"
            :label="$t('projects.working-team.add-member.cancel')"
            class="p-button-text"
            @click="close"
            :disabled="loading"
        />
        <pv-button
            type="submit"
            :label="$t('projects.working-team.add-member.add')"
            icon="pi pi-user-plus"
            :loading="saving"
            :disabled="!isFormValid"
        />
      </div>

      <p v-if="message" :class="messageType">{{ message }}</p>
    </form>
  </pv-dialog>
</template>

<script>
import { organizationService } from '../../organizations/services/organization.service.js';
import { projectTeamMemberService } from '../services/project-team-member.service.js';
import { ProjectRole } from '../model/project-role.js';
import {Select as PvSelect} from "primevue";

export default {
  name: 'AddProjectMember',
  components: {PvSelect},
  props: {
    organizationId: { type: [String, Number], required: true },
    projectId: { type: [String, Number], required: true },
    visible: { type: Boolean, default: false }
  },
  data() {
    return {
      members: [],
      selectedMember: null,
      selectedRole: null,
      specialty: '',
      loading: false,
      saving: false,
      message: '',
      messageType: '', // 'success' or 'error'
      ProjectRole, // para usar en template
      roleOptions: [
        { label: 'Coordinador', value: ProjectRole.COORDINATOR },
        { label: 'Especialista', value: ProjectRole.SPECIALIST }
      ]
    };
  },
  computed: {
    isFormValid() {
      return (
          this.selectedMember &&
          this.selectedRole &&
          (this.selectedRole !== ProjectRole.SPECIALIST || this.specialty.trim().length > 0)
      );
    }
  },
  methods: {
    async loadMembers() {
      this.loading = true;
      try {
        const response = await organizationService.getAllMembers(this.organizationId);
        const members = Array.isArray(response?.data) ? response.data : response;
;
        this.members = Array.isArray(response) ? response : (response.content || []);
      } catch (e) {
        this.message = this.$t('project.members.error_loading_members');
        this.messageType = 'error';
      } finally {
        this.loading = false;
      }
    },
    async handleAddMember() {
      this.saving = true;
      this.message = '';
      this.messageType = '';
      try {
        const payload = {
          role: this.selectedRole,
          specialty: this.selectedRole === ProjectRole.SPECIALIST ? this.specialty : "NON_APPLICABLE",
          organizationMemberId: this.selectedMember
        };
        // Si tu helper soporta query params:
        await projectTeamMemberService.create(payload, { projectId: this.projectId });

        this.message = this.$t('project.members.success_added');
        this.messageType = 'success';

        this.$emit('member-added');
        this.close();
      } catch (err) {
        this.message = err?.message || this.$t('project.members.error_adding_member');
        this.messageType = 'error';
      } finally {
        this.saving = false;
      }
    },

    close() {
      this.$emit('update:visible', false);
      this.$emit('close');
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.selectedMember = null;
        this.selectedRole = null;
        this.specialty = '';
        this.message = '';
        this.messageType = '';
        this.loadMembers();
      }
    }
  },
  created() {
    this.loadMembers();
  }
};
</script>

<style scoped>
.add-project-member-dialog {
  max-width: 400px;
}
.p-field {
  margin-bottom: 1.5rem;
}
.success {
  color: #4caf50;
  text-align: center;
  margin-top: 1rem;
}
.error {
  color: #f44336;
  text-align: center;
  margin-top: 1rem;
}
</style>
