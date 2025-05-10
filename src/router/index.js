import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/homePage.vue';
import About from '../pages/aboutPage.vue';
import { checkAuthState, getCurrentUserRole } from '../services/auth';

const routes = [
  { 
    path: '/', 
    name: 'Home', 
    component: Home,
    meta: { requiresAuth: false } 
  },
  { 
    path: '/about', 
    name: 'About', 
    component: About,
    meta: { requiresAuth: false } 
  },
  { 
    path: '/login', 
    name: 'Login',
    component: () => import('../components/auth/LoginForm.vue'),
    meta: { requiresAuth: false }
  },
  { 
    path: '/register', 
    name: 'Register',
    component: () => import('../components/auth/RegisterForm.vue'),
    meta: { requiresAuth: false }
  },
  { 
    path: '/announcements', 
    name: 'Announcements', 
    component: () => import('../pages/announcementsPage.vue'),
    meta: { requiresAuth: true } 
  },
  { 
    path: '/assessments', 
    name: 'Assessments', 
    component: () => import('../pages/assessmentsPage.vue'),
    meta: { requiresAuth: true } 
  },
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: () => import('../pages/dashboardPage.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'student'] } 
  },
  { 
    path: '/profile', 
    name: 'Profile', 
    component: () => import('../pages/profilePage.vue'),
    meta: { requiresAuth: true } 
  },
  { 
    path: '/resources', 
    name: 'Resources', 
    component: () => import('../pages/resourcesPage.vue'),
    meta: { requiresAuth: true } 
  },
  { 
    path: '/students', 
    name: 'Students', 
    component: () => import('../pages/studentsPage.vue'),
    meta: { requiresAuth: true, roles: ['teacher'] } 
  },
  {
    path: '/submissions/:submissionId/review',
    name: 'QuizReview',
    component: () => import('../components/QuizReview.vue')
  },
  {
    path: '/submissions/:submissionId/mark',
    name: 'MarkingInterface',
    component: () => import('../components/MarkingInterface.vue')
  },
  {
    path: '/quizzes/:quizId/submissions',
    name: 'QuizSubmissions',
    component: () => import('../components/QuizSubmissions.vue'),
    meta: { requiresAuth: true, roles: ['teacher'] }
  },
  {
    path: '/progress/:studentId?',
    name: 'Progress',
    component: () => import('../pages/progressPage.vue'),
    meta: { requiresAuth: true, roles: ['teacher', 'student'] }
  },
  {
    path: '/messages/:studentId',
    name: 'MessageThread',
    component: () => import('../components/MessageThread.vue'),
    meta: { 
      requiresAuth: true,
      roles: ['teacher', 'student'] 
    }
  },
  {
    path: '/quiz/:id',
    name: 'QuizPage',
    component: () => import('../components/QuizPage.vue'),
    meta: { 
      requiresAuth: true,
      roles: ['student'] 
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Authentication guard
router.beforeEach(async (to) => {
  const requiresAuth = to.meta.requiresAuth;
  const allowedRoles = to.meta.roles;
  
  const isAuthenticated = await checkAuthState();
  const userRole = await getCurrentUserRole();

  // Redirect authenticated users from auth pages
  if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    return '/dashboard';
  }

  // Handle protected routes
  if (requiresAuth) {
    if (!isAuthenticated) return '/login';
    if (allowedRoles && !allowedRoles.includes(userRole)) return '/unauthorized';
  }

  return true;
});

export default router;