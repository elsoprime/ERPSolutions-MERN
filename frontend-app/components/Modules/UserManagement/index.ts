/**
 * User Management Module Index
 * @description: Índice de exportación para todos los componentes del módulo de gestión de usuarios
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

// Main Page Component
export { default as UserManagementPage } from "./Views/UserManagementPage";

// Dashboard Components
export { default as UserOverviewDashboard } from "./Views/UserOverviewDashboard";
export { default as UsersAdminDashboard } from "./Views/UsersAdminDashboard";

// Form Components
export { UserForm, PermissionSelector } from "./Forms/UserForms";

// Table Components
export { default as UserTable } from "./UI/UserTable";
