<template>
  <div v-if="isContractor">
    <h3 class="mb-3">{{ $t('projects.budget_pie.title') }}</h3>
    <Chart
        :key="pieChartKey"
        type="pie"
        :data="pieData"
        :options="pieOptions"
        style="max-width: 430px; margin: auto; filter: drop-shadow(0 5px 32px rgba(18,70,225,0.22));"
        class="pie-3d"
    />
  </div>
</template>

<script>
import Chart from 'primevue/chart'
import { projectService } from '../services/project.service.js'
import { taskBudgetService } from '../services/task-budget.service.js'

export default {
  name: 'ProjectBudgetPie',
  components: { Chart },
  props: {
    projectId: { type: [String, Number], required: true }
  },
  data() {
    return {
      projectBudget: 0,
      totalTaskBudget: 0,
      loading: false,
      pieChartKey: 0 // Para forzar actualización del gráfico
    }
  },
  mounted() {
    // Hack para asegurarte que el canvas tenga fondo blanco
    setTimeout(() => {
      const canvas = this.$el.querySelector('canvas')
      if (canvas) {
        canvas.style.background = '#fff'
      }
    }, 400)
  },
  computed: {
    isContractor() {
      const user = JSON.parse(localStorage.getItem('user'))
      return user?.userType === 'TYPE_WORKER'
    },
    pieData() {
      const remainder = Math.max(this.projectBudget - this.totalTaskBudget, 0)
      // Gradientes falsos para simular 3D (chart.js 3.x+)
      return {
        labels: [
          this.$t('projects.budget_pie.tasks'),
          this.$t('projects.budget_pie.remainder')
        ],
        datasets: [{
          data: [this.totalTaskBudget, remainder],
          backgroundColor: ['#3b82f6', '#bbf7d0'],
          borderWidth: 8,
          borderColor: '#f3f4f6',
          hoverOffset: 15,
        }]
      }
    },
    pieOptions() {
      return {
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: '#22223b', // Asegura color oscuro
              font: { size: 17, family: 'Poppins, Arial, sans-serif', weight: 'bold' }
            }
          },
          tooltip: {
            backgroundColor: '#22223b',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#fff',
            borderWidth: 2
          }
        },
        layout: { padding: 16 },
        cutout: '0%',
        animation: {
          animateRotate: true,
          animateScale: true
        }
      }
    }
  },
  async created() {
    this.loading = true
    try {
      const [project, taskBudget] = await Promise.all([
        projectService.getById({ id: this.projectId }),
        taskBudgetService.getTotalTaskBudget({ projectId: this.projectId })
      ])
      this.projectBudget = project.budget
      this.totalTaskBudget = taskBudget.amount
      this.pieChartKey++  // Esto fuerza a Chart.js a re-renderizar el canvas
    } catch (e) {
      // Handle error
    } finally {
      this.loading = false
    }

  }

}
</script>

<style scoped>
.pie-3d canvas {
  /* Hace que el canvas tenga borde glossy (opcional, puro efecto) */
  border-radius: 50%;
  box-shadow: 0 10px 28px -6px #818cf8, 0 2px 24px 0 #a7f3d0;
  background: radial-gradient(circle at 60% 20%, #f8fafc 0%, #256dbf 60%, #1d5b98 100%);
  border: 2px solid #f3f4f6;
}
.mb-3 {
  margin-bottom: 1.5rem;
  color: #fff;
  text-shadow: 0 1px 8px rgba(218, 59, 59, 0.2);
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-align: center;
}
</style>


