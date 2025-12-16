import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, type RouteProps } from "wouter";

interface ProtectedRouteProps extends RouteProps {
    component: React.ComponentType<any>;
    adminOnly?: boolean;
}

export function ProtectedRoute({ component: Component, adminOnly, ...rest }: ProtectedRouteProps) {
    const { user, isLoading, isAdmin } = useAuth();

    return (
        <Route
            {...rest}
            component={(props) => {
                if (isLoading) {
                    return (
                        <div className="flex h-screen items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    );
                }

                if (!user) {
                    return <Redirect to="/login" />;
                }

                if (adminOnly && !isAdmin) {
                    return <Redirect to="/" />;
                }

                return <Component {...props} />;
            }}
        />
    );
}
