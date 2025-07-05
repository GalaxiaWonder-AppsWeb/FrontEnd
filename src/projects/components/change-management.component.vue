<template>
  <div class="change-management">
    <h2>{{ $t('change-management.title') }}</h2>
    <div v-if="isClient">
      <div v-if="showForm">
        <pv-textarea
            v-model="changeRequest.justification"
            :placeholder="$t('change-management.form.justification-label')"
            required
            rows="5"
        />
        <pv-button :label="$t('change-management.form.submit-button')" @click="submitRequest" :disabled="loading || !isFormValid()" />
        <pv-button :label="$t('change-management.form.cancel-button')" @click="cancelRequest" text />
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
// Importa tus componentes UI: pv-input-text, pv-button, pv-textarea, pv-progress-spinner...

export default {
  name: 'ChangeManagement',
  data() {
    return {
      requests: [],
      changeRequest: {
        justification: ''
      },
      loading: false,
      error: '',
      showForm: false,
      success: false
    }
  },
  computed: {
    isClient() {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log(user);
      return user?.userType === 'TYPE_CLIENT';
    },
    isContractor() {
      const user = JSON.parse(localStorage.getItem('user'));
      console.log(user);
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
        if (Array.isArray(res)) {
          this.requests = res;
        } else if (res && typeof res === 'object') {
          this.requests = [res]; // <-- mete el objeto en un array
        } else {
          this.requests = [];
        }

        console.log('[DEBUG]', this.requests.length, this.requests);
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
      this.changeRequest = { title: '', description: '' };
    },
    async approveRequest(req) {
      try {
        await changeProcessService.update(
            { changeProcessId: req.id ,

              response: "Aprobado por el contratista.",
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
        await changeProcessService.update(
            { changeProcessId: req.id ,   // params (lo reemplaza en la ruta)

              response: "Rechazado por el contratista.",
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
      // Ejemplo simple para clases de color
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
  color: #22223b;
  background: #f8f9fb;
  min-height: 100vh;
  padding: 2rem 0 0 0;
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

</style>
