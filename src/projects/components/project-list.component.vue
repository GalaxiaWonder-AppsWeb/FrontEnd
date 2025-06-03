<script>
import ProjectItem from "./project-item.component.vue";
import {projectService} from "../services/project.service.js";
import {ProjectAssembler} from "../services/project.assembler.js";
import CreateProject from "./create-project.component.vue";

export default {
  name: "ProjectList",
  components: {CreateProject, ProjectItem},
}
</script>

<template>

</template>

<style scoped>



</style>