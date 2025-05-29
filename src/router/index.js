import { createRouter, createWebHistory } from 'vue-router'

// Auth
import LoginPage from "../iam/pages/login-page.component.vue";
import RegisterPage from "../iam/pages/register-page.component.vue";

// Organizations
import OrganizationList from '../organizations/components/organization-list.component.vue'
import OrganizationInformationTab from '../organizations/pages/organization-information-tab.component.vue'
import OrganizationProjectsTab from '../organizations/pages/organization-projects-tab.component.vue'
import OrganizationMembersTab from '../organizations/pages/organization-members-tab.component.vue'
import OrganizationConfigurationTab from '../organizations/pages/organization-configuration-tab.component.vue'
import OrganizationInvitationsTab from "../organizations/pages/organization-invitations-tab.component.vue";

import WorkerLayout from "../organizations/pages/worker-layout.component.vue";
import OrganizationLayout from "../organizations/pages/organization-layout.component.vue";

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: LoginPage
    },
    {
        path: '/register',
        component: RegisterPage
    },
    {
        path: '',
        component: WorkerLayout,
        children: [
            {
                path: '/organizations',
                name: 'organizations',
                component: OrganizationList
            },
            {
              path: '/invitations',
                name: 'invitations',
                component: OrganizationInvitationsTab
            }
        ]
    },
    {
        path: '/organizations/:orgId',
        component: OrganizationLayout,
        children: [
            {
                path: '',
                redirect: to => ({
                    name: 'organization-information',
                    params: { orgId: to.params.orgId }
                })
            },
            {
                path: 'information',
                name: 'organization-information',
                component: OrganizationInformationTab
            },
            {
                path: 'projects',
                name: 'organization-projects',
                component: OrganizationProjectsTab
            },
            {
                path: 'members',
                name: 'organization-members',
                component: OrganizationMembersTab
            },
            {
                path: 'configuration',
                name: 'organization-configuration',
                component: OrganizationConfigurationTab
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
