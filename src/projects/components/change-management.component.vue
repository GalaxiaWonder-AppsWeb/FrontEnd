<template>
  <div class="change-management">
    <h2 class="change-management-title">{{ $t('change-management.title') }}</h2>
    <div v-if="isClient">
      <div v-if="showForm" class="request-form">
        <pv-textarea
            v-model="changeRequest.justification"
            :placeholder="$t('change-management.form.justification-label')"
            required
            rows="5"
            class="justification-textarea"
        />
        <div class="form-actions">
          <pv-button :label="$t('change-management.form.submit-button')" @click="submitRequest" :disabled="loading || !isFormValid()" />
          <pv-button :label="$t('change-management.form.cancel-button')" @click="cancelRequest" text />
        </div>
      </div>
      <div v-else>
        <pv-button :label="$t('change-management.new-request-button')" icon="pi pi-plus" @click="showForm = true" />
      </div>
      <p v-if="success" class="success">{{ $t('change-management.success-message') }}</p>
    </div>

    <!-- LISTA de solicitudes (para ambos, pero acciones solo para contractor) -->
    <div v-if="requests.length > 0">
      <div v-for="req in requests" :key="req.id" class="request-card">
        <div class="request-header">
          <span class="request-title">{{ req.justification }}</span>
          <span class="request-status" :class="statusClass(req.status)">
            {{ $t('change-management.status.' + req.status.toLowerCase()) }}
          </span>
        </div>
        <div class="request-description">{{ req.description }}</div>
        <div class="request-meta">
          <span>{{ $t('change-management.project-label') }}: {{ req.projectId }}</span>
          <span>{{ $t('change-management.check-date-label') }}: {{ formatDate(req.approvedAt) || $t('change-management.pending') }}</span>
        </div>
        <!-- Textarea para el contractor (solo si está pendiente) -->
        <div v-if="isContractor && req.status === 'PENDING'" class="contractor-response">
          <pv-textarea
              v-model="contractorResponses[req.id]"
              :placeholder="$t('change-management.response-label')"
              rows="3"
              class="response-textarea"
          />
        </div>
        <!-- Mostrar respuesta final (si ya fue respondido y hay respuesta) -->
        <div v-else-if="req.response" class="contractor-response-readonly">
          <span class="response-label">{{ $t('change-management.response-label') }}:</span>
          <div class="response-text">{{ req.response }}</div>
        </div>
        <div v-if="isContractor && req.status === 'PENDING'" class="request-actions">
          <pv-button
              :label="'✅ ' + $t('change-management.approve-button')"
              @click="approveRequest(req)"
          />
          <pv-button
              :label="'❌ ' + $t('change-management.reject-button')"
              severity="danger"
              @click="rejectRequest(req)"
          />
        </div>
      </div>
    </div>
    <div v-else-if="!loading">
      <p class="no-requests">{{ $t('change-management.no-requests') }}</p>
    </div>
    <pv-progress-spinner v-if="loading" />
  </div>
</template>

<script>
import { changeProcessService } from '../../changes/services/change-process.service.js'

export default {
  name: 'ChangeManagement',
  data() {
    return {
      requests: [],
      changeRequest: {
        justification: ''
      },
      contractorResponses: {}, // <--- Para mapear idRequest -> response escrita
      loading: false,
      error: '',
      showForm: false,
      success: false
    }
  },
  computed: {
    isClient() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.userType === 'TYPE_CLIENT';
    },
    isContractor() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.userType === 'TYPE_WORKER';
    }
  },
  async created() {
    await this.loadRequests();
  },
  methods: {
    async loadRequests() {
      this.loading = true;
      try {
        const projectId = this.$route.params.projectId;
        const res = await changeProcessService.getByProjectId({ projectId });

        // Convierte a array si no lo es
        let list = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && typeof res === 'object') {
          list = [res];
        }
        this.requests = list;
        // Inicializa contractorResponses
        this.contractorResponses = {};
        list.forEach(req => {
          this.contractorResponses[req.id] = '';
        });
      } catch (e) {
        this.error = e.message || 'Error loading requests';
      } finally {
        this.loading = false;
      }
    },
    async submitRequest() {
      this.loading = true;
      try {
        const projectId = this.$route.params.projectId;
        await changeProcessService.create({
          projectId,
          justification: this.changeRequest.justification
        });
        this.success = true;
        this.showForm = false;
        this.changeRequest.justification = '';
        await this.loadRequests();
      } catch (e) {
        this.error = e.message || 'Error creating request';
      } finally {
        this.loading = false;
      }
    },
    isFormValid() {
      return this.changeRequest.justification && this.changeRequest.justification.length > 5;
    },
    cancelRequest() {
      this.showForm = false;
      this.changeRequest = { justification: '' };
    },
    async approveRequest(req) {
      try {
        const responseText = this.contractorResponses[req.id] || '';
        await changeProcessService.update(
            { changeProcessId: req.id ,

              response: responseText,
              status: "APPROVED"
            }
        );
        this.$toast.add({ severity: 'success', summary: this.$t('change-management.status.approved'), life: 2000 });
        await this.loadRequests();
      } catch (e) {
        this.error = e.message || 'Error al aprobar la solicitud';
      }
    },
    async rejectRequest(req) {
      try {
        const responseText = this.contractorResponses[req.id] || '';
        await changeProcessService.update(
            { changeProcessId: req.id ,

              response: responseText,
              status: "REJECTED"
            }
        );
        await this.loadRequests();
        this.$toast.add({
          severity: "success",
          summary: "Solicitud rechazada",
          life: 2000
        });
      } catch (e) {
        this.error = e.message || "Error al rechazar solicitud";
      }
    },
    statusClass(status) {
      return {
        'PENDING': status === 'PENDING',
        'APPROVED': status === 'APPROVED',
        'REJECTED': status === 'REJECTED'
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleString();
    }
  }
}
</script>

<style scoped>
.change-management {
  padding: 2rem;
}

.change-management-title{
  color: var(--color-neutral-dark);
}

.request-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 400px;
  margin: 0 auto 2rem auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 8px rgba(30,58,138,0.07);
  padding: 2rem;
  gap: 1rem;
}

.justification-textarea {
  width: 100%;
  min-width: 260px;
  font-size: 1rem;
  margin-bottom: 0.7rem;
  background: #f8f9fb;
  color: #22223b;
}

.form-actions {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.request-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(30,58,138,0.07);
  margin-bottom: 1.7rem;
  padding: 1.5rem 2rem;
  color: #22223b;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 0.6rem;
}

.request-title {
  font-size: 1.07rem;
}

.request-status {
  font-size: 0.95rem;
  padding: 0.2rem 1rem;
  border-radius: 7px;
  font-weight: 500;
  background: #e0e7ff;
  color: #2d3748;
}
.request-status.approved {
  background: #e6fffa;
  color: #16a34a;
}
.request-status.pending {
  background: #fffbeb;
  color: #ca8a04;
}
.request-status.rejected {
  background: #ffe4e6;
  color: #be123c;
}
.request-description {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
.request-meta {
  font-size: 0.9rem;
  color: #575c66;
  margin-bottom: 0.5rem;
  display: flex;
  gap: 1.2rem;
}
.request-actions {
  display: flex;
  gap: 1rem;
}
.success {
  color: #16a34a;
  margin-top: 1rem;
  font-weight: bold;
}
.error {
  color: #be123c;
  margin-top: 1rem;
}
.no-requests {
  color: #555;
  font-style: italic;
  text-align: center;
  margin-top: 2rem;
}

.contractor-response {
  margin: 1rem 0 0.5rem 0;
}
.response-textarea {
  width: 100%;
  min-width: 220px;
  background: #f8f9fb;
  color: #22223b;
}
.contractor-response-readonly {
  margin-top: 0.8rem;
  background: #f8f8fa;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  color: #1e293b;
}
.response-label {
  font-weight: 600;
  color: #575c66;
  margin-right: 0.7rem;
}
.response-text {
  font-size: 0.97rem;
  color: #1e293b;
}

.p-button {
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
}
</style>
