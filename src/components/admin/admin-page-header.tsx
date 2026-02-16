import React from 'react';

interface AdminPageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
                {description && (
                    <p className="text-slate-500 mt-1">{description}</p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}

// Standard page container wrapper
interface AdminPageContainerProps {
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
    className?: string;
}

export function AdminPageContainer({ children, maxWidth = 'full', className = '' }: AdminPageContainerProps) {
    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        full: '',
    };

    return (
        <div className={`space-y-6 pb-8 ${maxWidth !== 'full' ? `${maxWidthClasses[maxWidth]} mx-auto` : ''} ${className}`}>
            {children}
        </div>
    );
}
