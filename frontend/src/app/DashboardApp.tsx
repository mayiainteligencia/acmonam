import { useState } from 'react';
import { ModernDashboardLayout } from '../components/ModernDashboardLayout';
import { AestheticBentoGrid } from '../components/AestheticBentoGrid';
import { Precision } from '../components/Precision';
import { Radio } from '../components/Radio';
import { Television } from '../components/Television';
import { Impresos } from '../components/Impresos';
import { ToastProvider } from '../components/shared/toast';
import { ConfirmProvider } from '../components/shared/confirm';
import '../responsive.css';

export function DashboardApp() {
  const [activeSection, setActiveSection] = useState('precision');

  const renderContent = () => {
    switch (activeSection) {
      case 'radio':
        return <Radio />;
      case 'tv':
        return <Television />;
      case 'impresos':
        return <Impresos />;
      default:
        return (
          <>
            <AestheticBentoGrid onExploreSection={setActiveSection} />
            <Precision />
          </>
        );
    }
  };

  return (
    <ToastProvider>
      <ConfirmProvider>
        <ModernDashboardLayout
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        >
          {renderContent()}
        </ModernDashboardLayout>
      </ConfirmProvider>
    </ToastProvider>
  );
}
