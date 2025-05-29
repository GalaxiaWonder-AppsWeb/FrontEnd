<script>
import ToolbarComponent from "../../public/components/toolbar-content.component.vue";

export default {
  name: "worker-layout",
  components: {ToolbarComponent}
}
</script>

<template>
  <div class="user-layout">
    <!-- Aquí insertarás tu ToolbarComponent -->
    <ToolbarComponent />

    <!-- Contenido privado de la app -->
    <main class="user-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.user-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

.user-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>