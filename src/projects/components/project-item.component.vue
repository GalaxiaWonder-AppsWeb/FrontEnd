<template>
  <router-link :to="`/projects/${project.id}`" class="card-link">
    <pv-card class="project-card">
      <template #content>
        <div class="project-content">
          <span class="project-name">{{ project.name }}</span>
        </div>
      </template>
    </pv-card>
  </router-link>
</template>

<script>
import { Project } from "../model/project.entity.js";

export default {
  name: "ProjectItem",
  props: {
    project: {
      type: Project,
      required: true
    },
    personId: String
  },
  created() {
    console.log(this.project.id)
    localStorage.setItem('project', JSON.stringify({id: this.project.id}));
  }
}
</script>



<style scoped>
.project-card {
  border-radius: 16px;
  background-color: #f8fbfa;
  box-shadow: 0 4px 12px rgba(5, 0, 0, 0.40);
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #101020;
}

.card-link {
  text-decoration: none;
  display: block;
}

</style>