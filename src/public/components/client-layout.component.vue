<template>
  <div class="client-layout">
    <!-- Top bar azul -->
    <div class="client-toolbar">
      <div class="toolbar-content">
        <h2 class="client-title">{{ $t('client.layout.title') }}</h2>
        <div class="toolbar-right">
          <span v-if="currentUser" class="user-name">{{ currentUser.name }} {{ currentUser.lastName }}</span>
          <button class="logout-btn" @click="confirmLogout">
            <i class="pi pi-sign-out"></i>
            {{ $t('auth.logout') }}
          </button>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
    <main class="client-main">
      <router-view />
    </main>
  </div>
</template>

<script>
import LanguageSwitcher from './language-switcher.component.vue'
import { authService } from "../../iam/services/auth.service.js";

export default {
  name: 'ClientLayout',
  components: { LanguageSwitcher },
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('user')) || null,
    }
  },
  methods: {
    async confirmLogout() {
      // Puedes cambiar confirm por tu propio modal, si tienes uno
      await this.logout();

    },
    async logout() {
      try {
        localStorage.clear();
        await authService.logout && authService.logout();
        this.$toast?.add({
          severity: 'success',
          summary: this.$t('auth.logout_success') || 'Sesión cerrada correctamente',
          life: 3000
        });
        window.location.href = '/login';
      } catch (error) {
        console.error("Error during logout:", error);
        this.$toast?.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cerrar la sesión correctamente',
          life: 3000
        });
      }
    }
  }
}
</script>

<style scoped>
.client-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.client-toolbar {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: #1e3a8a;
  color: white;
}
.toolbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
}
.client-title {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}
.user-name {
  font-weight: 500;
  font-size: 1.05rem;
  margin-right: 1.2rem;
  color: #fff;
}
.logout-btn {
  background: #213a8a;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1.1rem;
  font-weight: 500;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: #17306d;
}
.client-main {
  flex: 1;
  padding: 2rem 0 1rem 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 72px; /* Ajusta según la altura de tu toolbar */
}
</style>
