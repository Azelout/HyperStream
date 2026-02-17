import { GlassCard } from '../components/GlassCard';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, User } from 'lucide-react';

export const RoleSelection = () => {
    const { setRole } = useApp();
    const navigate = useNavigate();

    const handleSelectRole = (role: 'employer' | 'employee') => {
        setRole(role);
        navigate(role === 'employer' ? '/employer-dashboard' : '/employee-dashboard');
    };

    return (
        <div className="relative z-10 flex h-screen items-center justify-center p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                <GlassCard
                    onClick={() => handleSelectRole('employer')}
                    hoverEffect={true}
                    className="flex flex-col items-center justify-center h-80 group hover:border-neon-cyan transition-colors"
                >
                    <Briefcase className="w-16 h-16 text-white mb-6 group-hover:text-neon-cyan transition-colors duration-300" />
                    <h2 className="text-3xl font-bold mb-2">EMPLOYER</h2>
                    <p className="text-gray-400 text-center">Manage streams and monitor progress</p>
                </GlassCard>

                <GlassCard
                    onClick={() => handleSelectRole('employee')}
                    hoverEffect={true}
                    className="flex flex-col items-center justify-center h-80 group hover:border-neon-magenta transition-colors"
                >
                    <User className="w-16 h-16 text-white mb-6 group-hover:text-neon-magenta transition-colors duration-300" />
                    <h2 className="text-3xl font-bold mb-2">EMPLOYEE</h2>
                    <p className="text-gray-400 text-center">Deliver work and receive streaming payments</p>
                </GlassCard>
            </div>
        </div>
    );
};
