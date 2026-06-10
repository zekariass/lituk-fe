// "use client"

// import { useEffect, useState } from 'react';
// import { useAdminStore } from '@/lib/store/admin-store';
// import { AdminUser } from '@/lib/types/admin';
// import {
//   Search,
//   Shield,
//   User,
//   CheckCircle,
//   XCircle,
//   Loader2,
//   Edit,
// } from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog';

// export default function UsersPage() {
//   const {
//     users,
//     isLoading,
//     fetchUsers,
//     updateUserRole,
//     updateUserStatus,
//   } = useAdminStore();

//   const [searchTerm, setSearchTerm] = useState('');
//   const [roleFilter, setRoleFilter] = useState<string>('');
//   const [statusFilter, setStatusFilter] = useState<string>('');
//   const [currentPage, setCurrentPage] = useState(0);
//   const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
//   const [showRoleDialog, setShowRoleDialog] = useState(false);
//   const [showStatusDialog, setShowStatusDialog] = useState(false);
//   const [newRole, setNewRole] = useState('');
//   const [newStatus, setNewStatus] = useState('');

//   useEffect(() => {
//     loadUsers();
//   }, [currentPage, roleFilter, statusFilter, searchTerm]);

//   const loadUsers = async () => {
//     const params: Record<string, any> = {
//       page: currentPage,
//       size: 20,
//     };

//     if (roleFilter) {
//       params.role = roleFilter;
//     }
//     if (statusFilter) {
//       params.status = statusFilter;
//     }
//     if (searchTerm) {
//       params.search = searchTerm;
//     }

//     await fetchUsers(params);
//   };

//   const handleRoleChange = async () => {
//     if (!selectedUser || !newRole) return;
//     try {
//       await updateUserRole(selectedUser.id, newRole);
//       setShowRoleDialog(false);
//       setSelectedUser(null);
//       setNewRole('');
//       loadUsers();
//     } catch (error) {
//       console.error('Failed to update role:', error);
//     }
//   };

//   const handleStatusChange = async () => {
//     if (!selectedUser || !newStatus) return;
//     try {
//       await updateUserStatus(selectedUser.id, newStatus);
//       setShowStatusDialog(false);
//       setSelectedUser(null);
//       setNewStatus('');
//       loadUsers();
//     } catch (error) {
//       console.error('Failed to update status:', error);
//     }
//   };

//   const getRoleBadge = (role: string) => {
//     if (role === 'admin') {
//       return (
//         <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-950 text-purple-500">
//           <Shield className="h-3 w-3" />
//           Admin
//         </span>
//       );
//     }
//     if (role === 'moderator') {
//       return (
//         <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-950 text-blue-500">
//           <Shield className="h-3 w-3" />
//           Moderator
//         </span>
//       );
//     }
//     return (
//       <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
//         <User className="h-3 w-3" />
//         User
//       </span>
//     );
//   };

//   const getStatusBadge = (status: string) => {
//     if (status === 'active') {
//       return (
//         <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-500">
//           <CheckCircle className="h-3 w-3" />
//           Active
//         </span>
//       );
//     }
//     return (
//       <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-950 text-red-500">
//         <XCircle className="h-3 w-3" />
//         Inactive
//       </span>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Users</h1>
//           <p className="text-muted-foreground mt-2">
//             Manage user accounts and permissions
//           </p>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="flex gap-4 flex-wrap">
//         <div className="flex-1 min-w-[300px] relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <input
//             type="text"
//             placeholder="Search by email or name..."
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setCurrentPage(0);
//             }}
//             className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//           />
//         </div>
//         <select
//           value={roleFilter}
//           onChange={(e) => {
//             setRoleFilter(e.target.value);
//             setCurrentPage(0);
//           }}
//           className="px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//         >
//           <option value="">All Roles</option>
//           <option value="USER">User</option>
//           <option value="ADMIN">Admin</option>
//           <option value="MODERATOR">Moderator</option>
//         </select>
//         <select
//           value={statusFilter}
//           onChange={(e) => {
//             setStatusFilter(e.target.value);
//             setCurrentPage(0);
//           }}
//           className="px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//         >
//           <option value="">All Statuses</option>
//           <option value="active">Active</option>
//           <option value="inactive">Inactive</option>
//         </select>
//       </div>

//       {/* Users Table */}
//       <div className="rounded-lg border bg-card">
//         {isLoading ? (
//           <div className="flex items-center justify-center py-12">
//             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//           </div>
//         ) : !users || users.content.length === 0 ? (
//           <div className="text-center py-12 text-muted-foreground">
//             <p>No users found</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="border-b border-border">
//                 <tr>
//                   <th className="text-left p-4 font-semibold">User</th>
//                   <th className="text-left p-4 font-semibold">Email</th>
//                   <th className="text-left p-4 font-semibold">Role</th>
//                   <th className="text-left p-4 font-semibold">Status</th>
//                   <th className="text-left p-4 font-semibold">Email Verified</th>
//                   <th className="text-left p-4 font-semibold">Last Login</th>
//                   <th className="text-left p-4 font-semibold">Created</th>
//                   <th className="text-right p-4 font-semibold">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {users.content.map((user) => (
//                   <tr key={user.id} className="border-b border-border hover:bg-accent">
//                     <td className="p-4">
//                       <div className="font-medium">{user.fullName || 'N/A'}</div>
//                       <div className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
//                     </td>
//                     <td className="p-4">
//                       <div className="text-sm">{user.email}</div>
//                     </td>
//                     <td className="p-4">{getRoleBadge(user.role)}</td>
//                     <td className="p-4">{getStatusBadge(user.status)}</td>
//                     <td className="p-4">
//                       {user.emailVerified ? (
//                         <CheckCircle className="h-5 w-5 text-emerald-500" />
//                       ) : (
//                         <XCircle className="h-5 w-5 text-red-500" />
//                       )}
//                     </td>
//                     <td className="p-4">
//                       {user.lastLoginAt ? (
//                         <div className="text-sm">
//                           {new Date(user.lastLoginAt).toLocaleDateString()}
//                         </div>
//                       ) : (
//                         <span className="text-sm text-muted-foreground">Never</span>
//                       )}
//                     </td>
//                     <td className="p-4">
//                       <div className="text-sm">
//                         {new Date(user.createdAt).toLocaleDateString()}
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center justify-end gap-2">
//                         <button
//                           onClick={() => {
//                             setSelectedUser(user);
//                             setNewRole(user.role);
//                             setShowRoleDialog(true);
//                           }}
//                           className="p-2 hover:bg-accent rounded-lg transition-colors"
//                           title="Change Role"
//                         >
//                           <Shield className="h-4 w-4" />
//                         </button>
//                         <button
//                           onClick={() => {
//                             setSelectedUser(user);
//                             setNewStatus(user.status);
//                             setShowStatusDialog(true);
//                           }}
//                           className="p-2 hover:bg-accent rounded-lg transition-colors"
//                           title="Change Status"
//                         >
//                           <Edit className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {users && users.totalPages > 1 && (
//         <div className="flex items-center justify-between">
//           <div className="text-sm text-muted-foreground">
//             Showing {users.numberOfElements} of {users.totalElements} results
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setCurrentPage(currentPage - 1)}
//               disabled={currentPage === 0}
//               className="px-4 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Previous
//             </button>
//             <div className="flex items-center gap-2">
//               {Array.from({ length: Math.min(users.totalPages, 5) }, (_, i) => {
//                 let pageNum = i;
//                 if (users.totalPages > 5) {
//                   if (currentPage < 3) {
//                     pageNum = i;
//                   } else if (currentPage > users.totalPages - 3) {
//                     pageNum = users.totalPages - 5 + i;
//                   } else {
//                     pageNum = currentPage - 2 + i;
//                   }
//                 }
//                 return (
//                   <button
//                     key={pageNum}
//                     onClick={() => setCurrentPage(pageNum)}
//                     className={`w-10 h-10 rounded-lg ${
//                       currentPage === pageNum
//                         ? 'bg-primary text-primary-foreground'
//                         : 'border border-border hover:bg-accent'
//                     }`}
//                   >
//                     {pageNum + 1}
//                   </button>
//                 );
//               })}
//             </div>
//             <button
//               onClick={() => setCurrentPage(currentPage + 1)}
//               disabled={currentPage >= users.totalPages - 1}
//               className="px-4 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Role Change Dialog */}
//       <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Change User Role</DialogTitle>
//           </DialogHeader>
//           <div>
//             <p className="text-sm text-muted-foreground mb-4">
//               Change role for: <span className="font-medium text-foreground">{selectedUser?.email}</span>
//             </p>
//             <label className="block text-sm font-medium mb-2">New Role</label>
//             <select
//               value={newRole}
//               onChange={(e) => setNewRole(e.target.value)}
//               className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//             >
//               <option value="USER">User</option>
//               <option value="ADMIN">Admin</option>
//               <option value="MODERATOR">Moderator</option>
//             </select>
//           </div>
//           <DialogFooter>
//             <button
//               onClick={() => {
//                 setShowRoleDialog(false);
//                 setSelectedUser(null);
//                 setNewRole('');
//               }}
//               className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleRoleChange}
//               disabled={isLoading}
//               className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
//             >
//               {isLoading ? 'Updating...' : 'Update Role'}
//             </button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Status Change Dialog */}
//       <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Change User Status</DialogTitle>
//           </DialogHeader>
//           <div>
//             <p className="text-sm text-muted-foreground mb-4">
//               Change status for: <span className="font-medium text-foreground">{selectedUser?.email}</span>
//             </p>
//             <label className="block text-sm font-medium mb-2">New Status</label>
//             <select
//               value={newStatus}
//               onChange={(e) => setNewStatus(e.target.value)}
//               className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//             >
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           </div>
//           <DialogFooter>
//             <button
//               onClick={() => {
//                 setShowStatusDialog(false);
//                 setSelectedUser(null);
//                 setNewStatus('');
//               }}
//               className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleStatusChange}
//               disabled={isLoading}
//               className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
//             >
//               {isLoading ? 'Updating...' : 'Update Status'}
//             </button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }



"use client"

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/lib/store/admin-store';
import { AdminUser } from '@/lib/types/admin';
import {
  Search, Shield, User, CheckCircle, XCircle,
  Loader2, Edit, Sparkles, Users, ChevronLeft,
  ChevronRight, Check, AlertCircle, CheckCircle2,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

// ── Style tokens ───────────────────────────────────────────────────────────────
const inputClass = `
  w-full px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40
  transition-colors duration-200 placeholder:text-white/20
`

const selectClass = `
  px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40
  transition-colors duration-200
`

function SectionBlock({ title, icon: Icon, children }: {
  title: string; icon?: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
        {Icon && <Icon size={13} className="text-white/30" />}
        <h4 className="text-[10px] uppercase tracking-widest text-white/35 font-medium">{title}</h4>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

// ── Badges ─────────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  if (role === 'ADMIN' || role === 'admin') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                     uppercase tracking-widest border text-purple-300/70 bg-purple-300/10 border-purple-300/20">
      <Shield size={9} /> Admin
    </span>
  );
  if (role === 'MODERATOR' || role === 'moderator') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                     uppercase tracking-widest border text-sky-300/70 bg-sky-300/10 border-sky-300/20">
      <Shield size={9} /> Mod
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                     uppercase tracking-widest border text-white/40 bg-white/[0.05] border-white/10">
      <User size={9} /> User
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                     uppercase tracking-widest border text-emerald-300/70 bg-emerald-300/10 border-emerald-300/20">
      <CheckCircle size={9} /> Active
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                     uppercase tracking-widest border text-red-400/70 bg-red-400/10 border-red-400/20">
      <XCircle size={9} /> Inactive
    </span>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { users, isLoading, fetchUsers, updateUserRole, updateUserStatus } = useAdminStore();

  const [searchTerm,    setSearchTerm]    = useState('');
  const [roleFilter,    setRoleFilter]    = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [currentPage,   setCurrentPage]   = useState(0);
  const [selectedUser,  setSelectedUser]  = useState<AdminUser | null>(null);
  const [showRoleDialog,   setShowRoleDialog]   = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newRole,   setNewRole]   = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [feedback, setFeedback]   = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => { void loadUsers() }, [currentPage, roleFilter, statusFilter, searchTerm]);

  const loadUsers = async () => {
    const params: Record<string, any> = { page: currentPage, size: 20 };
    if (roleFilter)   params.role   = roleFilter;
    if (statusFilter) params.status = statusFilter;
    if (searchTerm)   params.search = searchTerm;
    await fetchUsers(params);
  };

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    try {
      await updateUserRole(selectedUser.id, newRole);
      setShowRoleDialog(false); setSelectedUser(null); setNewRole('');
      void loadUsers();
      setFeedback({ type: 'success', message: 'User role updated successfully.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to update role.' }) }
  };

  const handleStatusChange = async () => {
    if (!selectedUser || !newStatus) return;
    try {
      await updateUserStatus(selectedUser.id, newStatus);
      setShowStatusDialog(false); setSelectedUser(null); setNewStatus('');
      void loadUsers();
      setFeedback({ type: 'success', message: 'User status updated successfully.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to update status.' }) }
  };

  const totalPages = users?.totalPages ?? 0;

  const pageNumbers = (() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i);
    if (currentPage < 3) return [0, 1, 2, 3, 4];
    if (currentPage > totalPages - 3) return Array.from({ length: 5 }, (_, i) => totalPages - 5 + i);
    return Array.from({ length: 5 }, (_, i) => currentPage - 2 + i);
  })();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.4s ease both; }
        .delay-1 { animation-delay: 0.07s; }
        .delay-2 { animation-delay: 0.14s; }
        select option { background: #181920; color: #f0f0f5; }
      `}</style>

      <div className="font-dm text-[#f0f0f5] space-y-6 pb-10">

        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-300/[0.12]
                        bg-emerald-300/[0.04] px-6 py-5 animate-fade-up">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-300/[0.08] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-14 left-16 h-48 w-48 rounded-full bg-sky-300/[0.06] blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                            bg-emerald-300/10 border border-emerald-300/20 mb-3">
              <Sparkles size={11} className="text-emerald-300" />
              <span className="text-[10px] font-medium text-emerald-300/80 uppercase tracking-widest">
                Admin · Users
              </span>
            </div>
            <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">Users</h1>
            <p className="text-sm text-white/40 font-light mt-1">Manage user accounts and permissions.</p>
          </div>
        </div>

        {/* ── Feedback ── */}
        {feedback && (
          <div className={`flex items-start gap-2.5 px-4 py-3.5 rounded-xl border animate-fade-up
            ${feedback.type === 'success'
              ? 'bg-emerald-300/[0.07] border-emerald-300/20 text-emerald-300/80'
              : 'bg-red-400/[0.07] border-red-400/20 text-red-400/80'}`}>
            {feedback.type === 'success'
              ? <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-300" />
              : <AlertCircle  size={14} className="shrink-0 mt-0.5 text-red-400" />}
            <span className="text-sm font-light flex-1">{feedback.message}</span>
            <button onClick={() => setFeedback(null)}
              className="text-xs text-white/25 underline hover:text-white/50 shrink-0 transition-colors">
              Dismiss
            </button>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex gap-3 flex-wrap animate-fade-up delay-1">
          <div className="flex-1 min-w-[240px] relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by email or name…"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(0); }}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setCurrentPage(0); }}
            className={selectClass}>
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="MODERATOR">Moderator</option>
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(0); }}
            className={selectClass}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* ── Table ── */}
        <div className="animate-fade-up delay-2 rounded-2xl border border-white/[0.07]
                        bg-[#181920] shadow-[0_2px_16px_rgba(0,0,0,0.2)] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-emerald-300/50" />
            </div>
          ) : !users || users.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users size={28} className="text-white/15 mb-3" />
              <p className="text-sm text-white/30 font-light">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['User', 'Email', 'Role', 'Verified', 'Last Login', 'Created', ''].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left">
                        <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">{h}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.content.map((user, idx) => (
                    <tr key={user.id}
                      className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-150
                                  ${idx === users.content.length - 1 ? 'border-b-0' : ''}`}>

                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.09]
                                          flex items-center justify-center shrink-0">
                            <User size={13} className="text-white/35" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#f0f0f5]">{user.fullName || 'N/A'}</p>
                            <p className="text-[11px] text-white/25 font-light mt-0.5">
                              #{user.id.slice(0, 8)}…
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-white/55 font-light">{user.email}</span>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4"><RoleBadge role={user.role} /></td>

                      {/* Status */}
                      {/* <td className="px-5 py-4"><StatusBadge status={user.status} /></td> */}

                      {/* Verified */}
                      <td className="px-5 py-4">
                        {user.emailVerified
                          ? <CheckCircle size={15} className="text-emerald-300/70" />
                          : <XCircle    size={15} className="text-red-400/60" />}
                      </td>

                      {/* Last Login */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-white/45 tabular-nums font-light">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : <span className="text-white/20">Never</span>}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-white/45 tabular-nums font-light">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setSelectedUser(user); setNewRole(user.role); setShowRoleDialog(true); }}
                            title="Change Role"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                       text-white/40 border border-white/[0.08] hover:text-purple-300/80
                                       hover:border-purple-300/25 hover:bg-purple-300/[0.05] transition-all duration-200">
                            <Shield size={12} /> Role
                          </button>
                          <button
                            onClick={() => { setSelectedUser(user); setNewStatus(user.status); setShowStatusDialog(true); }}
                            title="Change Status"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                       text-white/40 border border-white/[0.08] hover:text-sky-300/80
                                       hover:border-sky-300/25 hover:bg-sky-300/[0.05] transition-all duration-200">
                            <Edit size={12} /> Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {users && totalPages > 1 && (
          <div className="flex items-center justify-between animate-fade-up">
            <p className="text-xs text-white/30 font-light tabular-nums">
              Showing <span className="text-white/50">{users.numberOfElements}</span> of{' '}
              <span className="text-white/50">{users.totalElements}</span> results
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 0}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/[0.09]
                           text-white/40 hover:text-white/70 hover:border-white/20
                           disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200">
                <ChevronLeft size={14} />
              </button>

              {pageNumbers.map(n => (
                <button key={n} onClick={() => setCurrentPage(n)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-medium transition-all duration-200
                    ${currentPage === n
                      ? 'bg-emerald-300 text-[#12131a] [box-shadow:0_0_16px_rgba(110,231,183,0.25)]'
                      : 'border border-white/[0.09] text-white/40 hover:text-white/70 hover:border-white/20'}`}>
                  {n + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= totalPages - 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/[0.09]
                           text-white/40 hover:text-white/70 hover:border-white/20
                           disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            Role Dialog
        ══════════════════════════════════════ */}
        <Dialog open={showRoleDialog} onOpenChange={open => { setShowRoleDialog(open); if (!open) { setSelectedUser(null); setNewRole(''); } }}>
          <DialogContent className="max-w-md bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-300/10 border border-purple-300/20 flex items-center justify-center shrink-0">
                  <Shield size={14} className="text-purple-300" />
                </div>
                <DialogTitle className="font-syne font-bold text-lg tracking-tight">Change Role</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <SectionBlock title="User">
                <p className="text-sm text-white/40 font-light">
                  Updating role for{' '}
                  <span className="text-white/70 font-medium">{selectedUser?.email}</span>
                </p>
              </SectionBlock>
              <SectionBlock title="New Role">
                <select value={newRole} onChange={e => setNewRole(e.target.value)}
                  className={`${selectClass} w-full`}>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MODERATOR">Moderator</option>
                </select>
              </SectionBlock>
            </div>

            <DialogFooter className="gap-2">
              <button onClick={() => { setShowRoleDialog(false); setSelectedUser(null); setNewRole(''); }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                           hover:text-white/85 hover:border-white/20 transition-all duration-200">
                Cancel
              </button>
              <button onClick={() => void handleRoleChange()} disabled={isLoading || !newRole}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                           transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Update Role
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════
            Status Dialog
        ══════════════════════════════════════ */}
        <Dialog open={showStatusDialog} onOpenChange={open => { setShowStatusDialog(open); if (!open) { setSelectedUser(null); setNewStatus(''); } }}>
          <DialogContent className="max-w-md bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-300/10 border border-sky-300/20 flex items-center justify-center shrink-0">
                  <Edit size={14} className="text-sky-300" />
                </div>
                <DialogTitle className="font-syne font-bold text-lg tracking-tight">Change Status</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <SectionBlock title="User">
                <p className="text-sm text-white/40 font-light">
                  Updating status for{' '}
                  <span className="text-white/70 font-medium">{selectedUser?.email}</span>
                </p>
              </SectionBlock>
              <SectionBlock title="New Status">
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className={`${selectClass} w-full`}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </SectionBlock>
            </div>

            <DialogFooter className="gap-2">
              <button onClick={() => { setShowStatusDialog(false); setSelectedUser(null); setNewStatus(''); }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                           hover:text-white/85 hover:border-white/20 transition-all duration-200">
                Cancel
              </button>
              <button onClick={() => void handleStatusChange()} disabled={isLoading || !newStatus}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                           transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Update Status
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
}