<template>
  <footer class="footer">

    <div class="footer-columns">
      <!-- Desktop Only Brand -->
      <div class="footer-brand desktop-only">
        <img src="../../assets/images/icons/product_logo.svg" alt="Logo ProP GMS" class="footer-logo" />
        <p>Galaxia Wonder</p>
      </div>

      <div class="footer-column">
        <h4>{{ $t('footer.learn-about.title') }}</h4>
        <a href="#">FAQ</a>
        <a href="#">{{ $t('footer.learn-about.privacy-policy') }}</a>
        <a href="#" @click.prevent="showModal = true">
          {{ $t('terms-and-conditions.title') }}
        </a>
      </div>

      <div class="footer-column">
        <h4>{{ $t('footer.contact-us') }}</h4>
        <a href="tel:+51930180813">+51 930 180 813</a>
        <a href="mailto:ventas@galaxiawonder.com">ventas&#64;galaxiawonder.com</a>
        <a href="#">
          Las Flores 22 Sta. Elizabeth II Etapa,<br />
          San Juan de Lurigancho.
        </a>
      </div>
    </div>
    <TermsAndConditionsModal :visible="showModal" @close="showModal = false" />
  </footer>
</template>

<script>
import TermsAndConditionsModal from './terms-and-conditions.component.vue'
// O ajusta la ruta según donde tengas el componente TermsAndConditions
export default {
  name: 'FooterComponent',
  components: { TermsAndConditionsModal },
  data() {
    return {
      showModal: false,
    }
  },
}
</script>

<style scoped>
.footer {
  padding: 2rem;
  background-color: #22396B;
  color: white;
}

.footer-columns {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: flex-start;
}

/* Brand column */
.footer-brand {
  flex: 1 1 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.footer-logo {
  width: 80px;
  margin-bottom: 0.5rem;
}

/* Individual column */
.footer-column {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  align-items: flex-start;
  text-align: left;
}

.footer-column h4 {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.footer-column a {
  color: white;
  text-decoration: none;
  font-size: 0.95rem;
  transition: opacity 0.2s;
}

.footer-column a:hover {
  opacity: 0.7;
}

/* Desktop */
@media (min-width: 768px) {
  .footer-columns {
    flex-direction: row;
  }

  .footer-brand,
  .footer-double-column {
    flex: 1 1 0;
    max-width: 50%;
  }

  .footer-brand {
    align-items: flex-start;
    text-align: left;
  }

  .footer-double-column {
    justify-content: space-between;
  }

  .footer-column {
    align-items: flex-start;
    text-align: left;
  }
}
</style>

