import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import AuthLayoutComponent from '../iam/components/auth-layout.component.vue'
import UserLayout from '../organizations/components/user-layout.component.vue'
import OrganizationLayout from '../organizations/components/organization-layout.component.vue'
import ProjectLayout from '../projects/components/project-layout.component.vue'

// Auth
import Login from '../iam/components/login-form.component.vue'
import Register from '../iam/components/register-form.component.vue'
import UserProfile from '../iam/components/user-profile.component.vue'

// Organizations
import OrganizationList from '../organizations/components/organization-list.component.vue'
import OrganizationInformation from '../organizations/components/organization-information.component.vue'
import OrganizationProjects from '../organizations/components/organization-projects.component.vue'
import OrganizationMembers from '../organizations/components/organization-members.component.vue'
import OrganizationSettings from '../organizations/components/organization-setting.component.vue'
import OrganizationInvitations from "../organizations/components/organization-invitations.component.vue";

// Projects
import ProjectList from '../projects/components/project-list.component.vue'
import ProjectInformation from '../projects/components/project-information.component.vue'
import ProjectMembers from '../projects/components/project-members.component.vue'
import ProjectSettings from '../projects/components/project-setting.component.vue'
import Schedule from '../projects/components/schedule.component.vue'

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/',
        component: AuthLayoutComponent,
        children: [
            { path: 'login', name: 'login', component: Login },
            { path: 'register', name: 'register', component: Register }
        ]
    },
    {
        path: '/profile',
        component: UserLayout,
        children: [
            {
                path: '',
                name: 'user-profile',
                component: UserProfile,
                meta: { requiresAuth: true }
            }
        ]
    },
    {
        path: '/organizations',
        component: UserLayout,
        children: [
            {
                path: '',
                name: 'organizations',
                component: OrganizationList
            },
            {
              path: 'invitations',
                name: 'invitations',
                component: OrganizationInvitations
            },
            {
                path: ':orgId',
                component: OrganizationLayout,
                meta: { requiresAuth: true, roles: ['contractor', 'specialist'] },
                children: [
                    {
                        path: '',
                        redirect: to => ({
                            name: 'organization-information',
                            params: { orgId: to.params.orgId }
                        })
                    },                    {
                        path: 'information',
                        name: 'organization-information',
                        component: OrganizationInformation,
                        meta: { allowedRoles: ['Contractor', 'Worker'] } // Todos pueden acceder
                    },
                    {
                        // Vista de lista de proyectos
                        path: 'projects',
                        name: 'organization-projects',
                        component: OrganizationProjects,
                        meta: { allowedRoles: ['Contractor', 'Worker'] } // Todos pueden acceder, pero se filtrará en el componente
                    },
                    {
                        // Vista de detalle de un proyecto específico
                        path: 'projects/:projectId',
                        component: ProjectLayout,
                        meta: { allowedRoles: ['Contractor', 'Worker'] }, // Todos pueden acceder, pero se filtrará en el componente
                        children: [
                            {
                                // Redirección predeterminada
                                path: '',
                                redirect: to => ({
                                    name: 'project-information',
                                    params: { orgId: to.params.orgId, projectId: to.params.projectId }
                                })
                            },                            {
                                // Vista principal de información del proyecto
                                path: 'information',
                                name: 'project-information',
                                component: ProjectInformation,
                                meta: { allowedRoles: ['Coordinator', 'Specialist'] } // Todos pueden acceder
                            },
                            {
                                // Vista de calendarios del proyecto
                                path: 'schedule',
                                name: 'schedule',
                                component: Schedule,
                                meta: { allowedRoles: ['Coordinator', 'Specialist'] } // Todos pueden acceder

                            },
                            {
                                // Vista de miembros del proyecto
                                path: 'working-team',
                                name: 'project-members',
                                component: ProjectMembers,
                                meta: { allowedRoles: ['Coordinator', 'Specialist'] } // Todos pueden acceder

                            },
                            {                        // Nueva vista de configuración del proyecto
                                path: 'settings',
                                name: 'project-settings',
                                component: ProjectSettings,
                                meta: { allowedRoles: ['Coordinator'] } // Solo el coordinador puede acceder
                            }
                        ]
                    },
                    {
                        path: 'members',
                        name: 'organization-members',
                        component: OrganizationMembers,
                        meta: { allowedRoles: ['Contractor', 'Worker'] } // Todos pueden acceder
                    },
                    {
                        path: 'settings',
                        name: 'organization-settings',
                        component: OrganizationSettings,
                        meta: { allowedRoles: ['Contractor'] } // Solo el contratista puede acceder
                    },

                ]
            }
        ]    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Guardia de navegación para validar permisos basados en roles
router.beforeEach(async (to, from, next) => {
    console.log('Navegando a:', to.path, 'Meta:', to.meta);
    
    // Verificar si la ruta requiere autenticación
    if (to.meta.requiresAuth) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            // Si no hay usuario autenticado, redirigir al login
            console.warn('Se requiere autenticación para acceder a esta ruta');
            // Guardar la ruta a la que intentaba acceder para redirección después del login
            sessionStorage.setItem('redirectAfterLogin', to.fullPath);
            
            if (window.$toast) {
                window.$toast.add({
                    severity: 'warn',
                    summary: 'Acceso denegado',
                    detail: 'Debe iniciar sesión para acceder a esta página',
                    life: 3000
                });
            }
            
            return next('/login');
        }
    }
    
    // Si la ruta no requiere roles específicos, permitir acceso
    if (!to.meta.allowedRoles) {
        return next();
    }
    
    // Obtener el usuario actual
    const user = JSON.parse(localStorage.getItem("user"));
    console.log('Usuario actual:', user);
    if (!user) {
        // Si no hay usuario autenticado, redirigir al login con mensaje
        // Guardar la ruta a la que intentaba acceder para redirección después del login
        sessionStorage.setItem('redirectAfterLogin', to.fullPath);
        return next('/login');
    }    // Si la ruta es parte de una organización, verificar si el usuario es el creador
    if (to.params.orgId && user.personId) {
        try {
            console.log(`Verificando si el usuario es creador de la organización ${to.params.orgId}...`);
            
            // Primero verificar si el usuario es miembro de la organización
            const memberResponse = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/organization/by-member-person-id/${user.id}`);
            console.log('Respuesta de la consulta de miembros:', memberResponse);
            if (memberResponse.ok) {
                const members = await memberResponse.json();
                
                if (members && members.length > 0) {
                    // El usuario es un miembro de la organización
                    const member = members[0];
                    console.log('Usuario es miembro de la organización:', member);
                    
                    // Guardar el ID del miembro para futuras referencias
                    user.memberId = member.id;
                    
                    // Verificar ahora si es creador consultando la organización
                    const orgResponse = await fetch(`${import.meta.env.VITE_PROPGMS_API_URL}/organization/${to.params.orgId}`);
                    
                    if (orgResponse.ok) {
                        const organization = await orgResponse.json();
                        console.log('Organización obtenida:', organization);
                        
                        if (organization && organization.createdBy === user.personId) {
                            console.log('Usuario es creador de la organización, asignando rol Contractor');
                            // Si es el creador, establecer el rol como Contractor
                            user.activeOrganizationRole = 'Contractor';
                        } else {
                            console.log('Usuario NO es creador de la organización, asignando rol Worker');
                            // Si no es el creador pero es miembro, establecer el rol como Worker
                            user.activeOrganizationRole = 'Worker';
                        }
                        
                        // Guardar los cambios
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                } else {
                    console.warn('El usuario no es miembro de esta organización');
                }
            }
        } catch (error) {
            console.error('Error al verificar el rol del usuario en la organización:', error);
        }
    }    // Verificar si la ruta es de un proyecto
    const isProjectRoute = to.path.includes('/projects/') && to.params.projectId;
      
    // Determinar qué rol usar para la verificación
    let userRole;
    
    if (isProjectRoute) {
        console.log('Accediendo a una ruta de proyecto específico:', to.path);
        
        // Si es contratista de la organización, asignar automáticamente rol de coordinador para el proyecto
        if (user.activeOrganizationRole === 'Contractor') {
            user.activeProjectRole = 'Coordinator';
            localStorage.setItem('user', JSON.stringify(user));
            console.log('Usuario es Contractor, asignado automáticamente como Coordinator en el proyecto');
        } else if (user.activeOrganizationRole === 'Worker') {
            // Para Workers, verificar si tienen un rol de proyecto asignado
            if (!user.activeProjectRole) {
                console.log('Worker sin rol de proyecto asignado, estableciendo Specialist por defecto');
                user.activeProjectRole = 'Specialist';
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                console.log(`Worker con rol de proyecto existente: ${user.activeProjectRole}`);
            }
        }
        
        userRole = user.activeProjectRole;
        console.log("Verificando acceso con rol de proyecto:", userRole);
    } else {
        userRole = user.activeOrganizationRole;
        console.log("Verificando acceso con rol de organización:", userRole);
        
        // Si el usuario es un Worker, añadir información para debugging
        if (userRole === 'Worker') {
            console.log("Usuario es Worker en la organización");
        }
    }// Adaptar el rol Worker para que coincida con las rutas
    let adaptedRole = userRole;
      // Comprobar si userRole es undefined y asignar un rol predeterminado 
    if (!adaptedRole) {
        // No mostrar advertencia, simplemente establecer el rol como Worker
        adaptedRole = 'Worker'; // Establecer un valor predeterminado para evitar errores
        
        // Guardar el rol en el objeto de usuario y localStorage para futuras referencias
        try {
            let refreshedUser = JSON.parse(localStorage.getItem("user")) || {};
            refreshedUser.activeOrganizationRole = 'Worker';
            localStorage.setItem("user", JSON.stringify(refreshedUser));
            console.log("Rol Worker establecido en localStorage para usuario:", refreshedUser);
        } catch (e) {
            console.error("Error al intentar guardar el rol en localStorage:", e);
        }
    }
    
    // Compatibilidad específica para rol Worker
    if (adaptedRole === 'Worker' && !isProjectRoute) {
        console.log("Adaptando rol Worker para permisos de organización");
        // Ya no es necesario buscar si la ruta acepta Worker, simplemente lo aceptamos
    }
    
    if (to.meta.allowedRoles && to.meta.allowedRoles.includes(adaptedRole)) {
        // El usuario tiene el rol permitido, continuar
        console.log(`Acceso permitido con rol: ${adaptedRole}`);
        return next();
    } else if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(adaptedRole)) {
        // El usuario no tiene permiso para acceder a esta ruta
        console.warn(`Acceso denegado: El rol ${adaptedRole} no tiene permiso para acceder a ${to.path}`);
        // Si intentaba acceder a configuraciones de organización, redirigir a información
        if (to.name === 'organization-settings') {
            console.warn('Acceso denegado: Solo el contratista puede acceder a la configuración');
            // Mostrar mensaje de acceso denegado (usando toast si está disponible en window)
            if (window.$toast) {
                window.$toast.add({
                    severity: 'warn',
                    summary: 'Acceso denegado',
                    detail: 'Solo el contratista puede acceder a la configuración',
                    life: 3000
                });
            }
            return next(`/organizations/${to.params.orgId}/information`);
        }
        
        // Si intentaba acceder a configuraciones de proyecto, redirigir a información del proyecto
        if (to.name === 'project-settings') {
            console.warn('Acceso denegado: Solo el coordinador puede acceder a la configuración del proyecto');
            if (window.$toast) {
                window.$toast.add({
                    severity: 'warn',
                    summary: 'Acceso denegado',
                    detail: 'Solo el coordinador puede acceder a la configuración del proyecto',
                    life: 3000
                });
            }
            return next(`/organizations/${to.params.orgId}/projects/${to.params.projectId}/information`);
        }        // Para otras rutas protegidas, proporcionar información detallada de depuración
        console.warn(`Acceso denegado: El rol ${adaptedRole} no tiene permiso para acceder a ${to.path}`);
        console.log('Roles permitidos:', to.meta.allowedRoles);
        console.log('Información del usuario:', user);
          // Verificar si el rol está definido o no
        if (!adaptedRole) {
          console.error("Error crítico: Rol de usuario indefinido. Reparando...");
          
          try {
            // Forzar un reintento antes de rechazar el acceso
            let refreshedUser = JSON.parse(localStorage.getItem("user")) || {};
            console.log("Usuario antes de actualizar:", refreshedUser);
            
            // Asegurarnos de que tenemos un objeto user válido
            if (!refreshedUser) refreshedUser = {};
            
            // Establecer el rol como Worker (no advierte, lo establece directamente)
            refreshedUser.activeOrganizationRole = "Worker";
            localStorage.setItem("user", JSON.stringify(refreshedUser));
            
            console.log("Rol establecido a Worker automáticamente:", refreshedUser);
            
            // Actualizar la variable adaptedRole para continuar con la navegación
            adaptedRole = "Worker";
          } catch (e) {
            console.error("Error al intentar reparar el rol del usuario:", e);
          }
        }
        
        // Mostrar mensaje de acceso denegado (usando toast si está disponible)
        if (window.$toast) {
            window.$toast.add({
                severity: 'warn',
                summary: 'Acceso denegado',
                detail: `No tienes permiso para acceder a esta página. Tu rol: ${adaptedRole || 'No definido'}`,
                life: 5000
            });
        }
        
        // Si venía de una ruta válida, volver a ella, sino ir a información
        if (from.name) {
            return next(from.path);
        } else {
            // Redirigir según el contexto (proyecto u organización)
            if (isProjectRoute) {
                return next(`/organizations/${to.params.orgId}/projects/${to.params.projectId}/information`);
            } else {
                return next(`/organizations/${to.params.orgId}/information`);
            }
        }
    }
    
    // Por defecto, permitir el acceso
    next();
});

export default router
