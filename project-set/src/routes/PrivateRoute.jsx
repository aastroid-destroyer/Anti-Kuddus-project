import React from 'react';
import useAuth from '../hooks/useAuth';
import { Navigate, useLocation } from 'react-router';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    
    if (loading) {
        return (
            <div
                role="status"
                aria-live="polite"
                className="flex min-h-[100dvh] items-center justify-center bg-bg"
            >
                <span className="sr-only">Loading</span>
                <span
                    aria-hidden="true"
                    className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent motion-reduce:animate-none"
                />
            </div>
        );
    }

    if(!user){
        return <Navigate state={location.pathname} to="/login"></Navigate>
    }

    return children;
};

export default PrivateRoute;