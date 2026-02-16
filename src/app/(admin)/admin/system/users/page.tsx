import { getUsers } from '@/app/actions/users';
import { UserList } from '@/components/admin/user-list';
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export default async function AdminUsersPage() {
    const users = await getUsers();

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Users"
                description="Manage all registered users and their roles."
            />
            <UserList users={users} />
        </AdminPageContainer>
    );
}
