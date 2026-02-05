import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
   const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
   const [checkingAdmin, setCheckingAdmin] = useState(requireAdmin);
 
   useEffect(() => {
     const checkAdminRole = async () => {
       if (!user || !requireAdmin) {
         setCheckingAdmin(false);
         return;
       }
 
       try {
         const { data, error } = await supabase
           .from('user_roles')
           .select('role')
           .eq('user_id', user.id)
           .eq('role', 'admin')
           .maybeSingle();
 
         setIsAdmin(!!data && !error);
       } catch {
         setIsAdmin(false);
       } finally {
         setCheckingAdmin(false);
       }
     };
 
     if (user && requireAdmin) {
       checkAdminRole();
     }
   }, [user, requireAdmin]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
     if (!loading && !checkingAdmin && requireAdmin && isAdmin === false) {
       navigate('/dashboard');
     }
   }, [user, loading, navigate, requireAdmin, isAdmin, checkingAdmin]);

   if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-banking-green-light to-accent flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
               <p className="mt-4 text-muted-foreground">{requireAdmin ? 'Verifying admin access...' : 'Loading...'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

   if (requireAdmin && isAdmin === false) {
     return null;
   }
 
  return <>{children}</>;
};

export default ProtectedRoute;