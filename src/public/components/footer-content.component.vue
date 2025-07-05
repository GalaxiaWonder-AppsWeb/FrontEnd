<template>
  <footer class="footer">
    <!-- Mobile Only Brand -->
    <div class="footer-brand mobile-only">
      <img src="../../assets/images/icons/product_logo.svg" alt="Logo ProP GMS" class="footer-logo" />
      <p>Galaxia Wonder</p>
    </div>

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

    <div class="footer-bottom">
      <p>Copyright &copy; 2025 Galaxia Wonder. {{ $t('footer.rights') }}</p>
      <div class="footer-social">
        <a href="#"><i class="pi pi-camera"></i></a>
        <a href="#"><i class="pi pi-times"></i></a>
        <a href="#"><i class="pi pi-briefcase"></i></a>
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
  left: 0;
  bottom: 0;
  width: 100vw;
  min-width: 100vw;
  z-index: 100;
  background: #1c2331;
  color: #fff;
  /* No uses position fixed aquí */
  box-shadow: 0 -2px 14px #00000025;
}
.footer-logo {
  height: 44px;
  margin-bottom: 0.6rem;
}
.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}
.footer-columns {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1050px;
  margin: 0 auto;
}
.footer-column {
  flex: 1;
  min-width: 220px;
  margin: 0 1rem 2rem 1rem;
}
.footer-column h4 {
  font-size: 1.07em;
  margin-bottom: 0.6em;
  font-weight: 600;
  color: #ffd600;
}
.footer-column a {
  display: block;
  color: #b3b9c9;
  margin-bottom: 0.6em;
  text-decoration: none;
  font-size: 0.97em;
  transition: color 0.2s;
}
.footer-column a:hover {
  color: #fff;
}
.footer-bottom {
  border-top: 1px solid #33394c;
  padding-top: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.98em;
}
.footer-social {
  margin-top: 0.5rem;
}
.footer-social a {
  margin: 0 0.4em;
  color: #ffd600;
  font-size: 1.35em;
  text-decoration: none;
  transition: color 0.2s;
}
.footer-social a:hover {
  color: #fff;
}
.mobile-only {
  display: none;
}
.desktop-only {
  display: flex;
}
/* Responsive: Show/hide mobile/desktop brand */
@media (max-width: 700px) {
  .footer-columns {
    flex-direction: column;
    align-items: center;
  }
  .footer-brand.desktop-only {
    display: none;
  }
  .footer-brand.mobile-only {
    display: flex;
  }
}
@media (min-width: 701px) {
  .footer-brand.desktop-only {
    display: flex;
  }
  .footer-brand.mobile-only {
    display: none;
  }
}
</style>
