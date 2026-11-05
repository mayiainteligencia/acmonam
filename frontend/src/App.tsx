import { useState } from 'react';
import { ResponsiveLayout } from './components/ResponsiveLayout';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Precision } from './components/Precision';
import { Radio } from './components/Radio';
import { Television } from './components/Television';
import { Impresos } from './components/Impresos';
import { ToastProvider } from './components/shared/toast';
import { ConfirmProvider } from './components/shared/confirm';
import { brandingConfig } from './config/branding';
import { secciones } from './config/menu';
import { FONDO_OSCURO, SECCIONES_OSCURAS } from './config/tema';


import './responsive.css';

function App() {
  const [activeSection, setActiveSection] = useState('precision');
  const { colores } = brandingConfig;

  const getTitulo = () =>
    secciones.find(s => s.id === activeSection)?.nombre ?? 'Precisión General';

  const renderContent = () => {
    switch (activeSection) {
      case 'radio':    return <Radio />;
      case 'tv':       return <Television />;
      case 'impresos': return <Impresos />;
      default:         return <Precision />;
    }
  };

  return (
    <ToastProvider>
     <ConfirmProvider>
      <ResponsiveLayout
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        header={<Header title={getTitulo()} onSectionChange={setActiveSection} />}
        sidebar={
          <Sidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        }
      >
        <div style={{ flex: 1, overflow: 'auto', minHeight: '100%', backgroundColor: SECCIONES_OSCURAS.includes(activeSection) ? FONDO_OSCURO : colores.fondoPrincipal }}>
          {renderContent()}
        </div>
      </ResponsiveLayout>
     </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;