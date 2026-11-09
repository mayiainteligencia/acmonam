import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Shield, 
  FileText, 
  Lock, 
  CheckCircle2, 
  X, 
  Download, 
  Scale, 
  Search, 
  ExternalLink, 
  Building2, 
  Database, 
  KeyRound, 
  Cookie, 
  FileCheck2,
  Clock
} from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  initialTab?: 'privacidad' | 'terminos' | 'nda' | 'custodia';
}

interface SeccionPrivacidad {
  id: string;
  num: string;
  titulo: string;
  icono: React.ElementType;
  contenido: React.ReactNode;
  resumen?: string;
}

export const LegalModal: React.FC<LegalModalProps> = ({ 
  isOpen, 
  onClose, 
  onAccept,
  initialTab = 'privacidad' 
}) => {
  const [tabActiva, setTabActiva] = useState<'privacidad' | 'terminos' | 'nda' | 'custodia'>(initialTab);
  const [busqueda, setBusqueda] = useState('');

  const seccionesPrivacidad: SeccionPrivacidad[] = useMemo(() => [
    {
      id: 'sec-1',
      num: '01',
      titulo: 'Identidad y domicilio del responsable',
      icono: Building2,
      resumen: 'MAYIA Inteligencia Artificial, S.A.P.I. de C.V. como responsable y encargado.',
      contenido: (
        <div>
          <p>
            <strong>MAYIA Inteligencia Artificial, S.A.P.I. de C.V.</strong> (en adelante, <em>“MAYIA”</em>), con domicilio para efectos de este aviso en{' '}
            <span style={badgePendienteStyle}>Domicilio legal por asentar</span>, es responsable del tratamiento de datos personales que recabe directamente en su carácter de responsable.
          </p>
          <p style={{ marginTop: '10px' }}>
            <strong>Contacto de privacidad:</strong>{' '}
            <span style={badgePendienteStyle}>privacidad@mayia.mx · Pendiente acreditación</span>.
          </p>
          <div style={calloutNotaStyle}>
            Cuando MAYIA trate datos por instrucciones de <strong>ACAM</strong> u otro cliente, las funciones y obligaciones de cada parte se establecerán en el contrato principal y, cuando proceda, en un <strong>Acuerdo de Tratamiento de Datos (DPA)</strong> específico.
          </div>
        </div>
      )
    },
    {
      id: 'sec-2',
      num: '02',
      titulo: 'Categorías y origen de datos',
      icono: Database,
      resumen: 'Datos de contacto, credenciales, métricas y capturas procedentes de fuentes autorizadas.',
      contenido: (
        <div>
          <p>
            Podrán tratarse datos de identificación y contacto de representantes, clientes y usuarios autorizados; credenciales y registros de acceso; datos de facturación; solicitudes de soporte técnico; identificadores técnicos y registros de uso en plataforma.
          </p>
          <p style={{ marginTop: '10px' }}>
            Los resultados de monitoreo pueden incluir nombres, voces, cargos, declaraciones y referencias a personas identificadas o identificables procedentes de transmisiones de <strong>radio, televisión, prensa impresa</strong> y otras fuentes autorizadas para auditoría.
          </p>
          <div style={calloutAlertaStyle}>
            <strong>Criterio Jurídico Fundamental:</strong> No se presupone que la difusión pública en medios de comunicación elimine la protección ni el régimen tutelar de los datos personales.
          </div>
        </div>
      )
    },
    {
      id: 'sec-3',
      num: '03',
      titulo: 'Finalidades necesarias',
      icono: FileCheck2,
      resumen: 'Gestión de cuentas, autenticación, telemetría, auditoría contractual y cumplimiento legal.',
      contenido: (
        <div>
          <p>El tratamiento de los datos es estrictamente necesario para las siguientes finalidades primarias del servicio:</p>
          <ul style={listaStyle}>
            <li>Administrar cuentas corporativas, contratos y relaciones comerciales con ACAM y clientes autorizados.</li>
            <li>Autenticar y auditar accesos de usuarios a la consola de telemetría.</li>
            <li>Prestar el servicio contratado de monitoreo continuo en medios de comunicación.</li>
            <li>Localizar, indexar y clasificar menciones y pautas publicitarias con algoritmos de IA.</li>
            <li>Entregar reportes y testigos acreditados a usuarios con permisos vigentes.</li>
            <li>Atender incidencias técnicas a través de la Mesa de Ayuda y soporte NOC.</li>
            <li>Preservar la seguridad, trazabilidad operativa y cadena de custodia probatoria de evidencias.</li>
            <li>Facturación, cobranza y cumplimiento de obligaciones fiscales y normativas.</li>
            <li>Gestionar solicitudes de derechos ARCO y responder requerimientos válidos de autoridades competentes.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'sec-4',
      num: '04',
      titulo: 'Finalidades secundarias',
      icono: FileText,
      resumen: 'Comunicaciones informativas o encuestas sujetas a consentimiento expreso y revocable.',
      contenido: (
        <div>
          <p>
            Con el consentimiento previo cuando legalmente corresponda, los datos podrán utilizarse para el envío de comunicaciones comerciales sobre actualizaciones de producto, encuestas de satisfacción y propuestas de servicios analíticos.
          </p>
          <div style={calloutNotaStyle}>
            <strong>Garantía de no condicionamiento:</strong> La negativa para el uso de sus datos en finalidades secundarias en ningún momento condicionará ni restringirá la prestación del servicio principal de monitoreo contratado.
            <div style={{ marginTop: '6px' }}>
              Mecanismo directo para manifestar negativa u oposición:{' '}
              <span style={badgePendienteStyle}>buzon.legal@mayia.mx</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sec-5',
      num: '05',
      titulo: 'Bases de legitimación y datos sensibles',
      icono: Scale,
      resumen: 'Fundamento legal acreditado. Prohibición de perfilamiento ideológico o decisiones autónomas vinculantes.',
      contenido: (
        <div>
          <p>
            MAYIA identificará la base jurídica aplicable a cada operación y recabará el consentimiento cuando sea legalmente exigible conforme a la <em>LFPDPPP</em>.
          </p>
          <p style={{ marginTop: '10px' }}>
            <strong>Exclusión de Datos Sensibles:</strong> MAYIA no tratará intencionalmente datos sensibles salvo necesidad acreditada y fundamento legal suficiente, incluyendo consentimiento expreso por escrito cuando proceda.
          </p>
          <div style={calloutAlertaStyle}>
            <strong>Límite Ético y Regulatorio:</strong> La monitorización de emisiones y noticias no autoriza por sí sola la generación de perfiles sensibles, inferencias de afiliación política, religiosa o sindical, ni la adopción de decisiones automatizadas con efectos jurídicos vinculantes para los titulares.
          </div>
        </div>
      )
    },
    {
      id: 'sec-6',
      num: '06',
      titulo: 'Transferencias y encargados',
      icono: KeyRound,
      resumen: 'Proveedores de nube, seguridad e infraestructura bajo estrictas cláusulas de confidencialidad.',
      contenido: (
        <div>
          <p>
            Podrán intervenir proveedores de infraestructura en la nube, alojamiento, seguridad perimetral, soporte y analítica bajo instrucciones expresas de MAYIA y sujetos a compromisos contractuales vinculantes de confidencialidad y resguardo.
          </p>
          <p style={{ marginTop: '10px' }}>
            Las transferencias a terceros distintos de los encargados se realizarán únicamente al amparo de una base legal legítima y, en su caso, con el consentimiento correspondiente, identificando con antelación a los destinatarios y las finalidades precisas.
          </p>
          <div style={calloutNotaStyle}>
            Inventario detallado de subencargados, centros de datos y jurisdicciones territoriales:{' '}
            <span style={badgePendienteStyle}>Inventario Operativo ACAM-MAYIA v1.0 en proceso</span>
          </div>
        </div>
      )
    },
    {
      id: 'sec-7',
      num: '07',
      titulo: 'Conservación y eliminación',
      icono: Clock,
      resumen: 'Retención justificada por contrato y calendario de bloqueo documentado.',
      contenido: (
        <div>
          <p>
            Los datos personales y registros de auditoría se conservarán únicamente durante el plazo estrictamente necesario para el cumplimiento de las finalidades pactadas, las obligaciones legales vigentes y la defensa de derechos comerciales.
          </p>
          <div style={calloutAlertaStyle}>
            <strong>Regla Específica sobre Testigos Audiovisuales:</strong> Los testigos de audio, video y prensa no se conservarán de manera automática tres meses; dicho plazo únicamente será aplicable a materiales cuya captura y preservación estén expresamente autorizadas en el anexo de servicio acordado con el cliente.
          </div>
          <p style={{ marginTop: '10px' }}>
            Se mantendrá un calendario documentado de retención programada, bloqueo seguro y eliminación definitiva con borrado criptográfico de evidencias.
          </p>
        </div>
      )
    },
    {
      id: 'sec-8',
      num: '08',
      titulo: 'Seguridad y gestión de incidentes',
      icono: Shield,
      resumen: 'Controles proporcionales, roles, cifrado, bitácoras y protocolos sin declaraciones engañosas.',
      contenido: (
        <div>
          <p>
            Se implementan medidas de seguridad administrativas, técnicas y físicas proporcionales al riesgo de la operación:
          </p>
          <ul style={listaStyle}>
            <li>Control de acceso granular basado en roles y permisos mínimos indispensables.</li>
            <li>Autenticación de sesiones y trazabilidad de eventos en plataforma.</li>
            <li>Cifrado en tránsito (TLS) y reposo en componentes críticos de almacenamiento.</li>
            <li>Bitácoras de auditoría inmutables y segregación estricta de ambientes de cómputo.</li>
            <li>Procedimiento documentado para respuesta, mitigación y contención de incidentes de seguridad.</li>
          </ul>
          <div style={calloutNotaStyle}>
            <strong>Transparencia Profesional:</strong> No se declara ninguna certificación ISO ni auditoría externa que no se encuentre formalmente acreditada y vigente. Las notificaciones de incidencias se realizarán oportunamente conforme a los plazos legales y contractuales.
          </div>
        </div>
      )
    },
    {
      id: 'sec-9',
      num: '09',
      titulo: 'Derechos ARCO, revocación y limitación',
      icono: Scale,
      resumen: 'Mecanismos de Acceso, Rectificación, Cancelación y Oposición conforme a la LFPDPPP.',
      contenido: (
        <div>
          <p>
            Toda persona titular o su representante legal debidamente acreditado podrá ejercer en cualquier momento sus derechos de <strong>Acceso, Rectificación, Cancelación u Oposición (ARCO)</strong>, así como solicitar la revocación del consentimiento o la limitación del uso y divulgación de sus datos.
          </p>
          <div style={calloutNotaStyle}>
            <strong>Vía de Atención Formal:</strong> Canal centralizado de solicitudes:{' '}
            <span style={badgePendienteStyle}>privacidad@mayia.mx · Formato ARCO Digital</span>
          </div>
          <p style={{ marginTop: '10px' }}>
            La solicitud deberá contener la identificación plena del titular, la descripción clara del derecho ejercido y los documentos que sustenten la petición. MAYIA atenderá los plazos y excepciones previstos en la legislación mexicana aplicable e informará su resolución a través del medio formal designado.
          </p>
        </div>
      )
    },
    {
      id: 'sec-10',
      num: '10',
      titulo: 'Cookies, plataformas y decisiones automatizadas',
      icono: Cookie,
      resumen: 'Tecnologías web y carácter asistivo y supervisado de los modelos de inteligencia artificial.',
      contenido: (
        <div>
          <p>
            En caso de utilizar cookies técnicas, identificadores de sesión o analítica en el portal, se informarán sus categorías, finalidades y mecanismos de gestión dentro de la política complementaria de cookies.
          </p>
          <div style={calloutAlertaStyle}>
            <strong>Naturaleza de la Inteligencia Artificial:</strong> Los resultados emitidos por los motores de transcripción, detección fonética y reconocimiento óptico son <em>asistivos</em>; por su naturaleza probabilística pueden contener inconsistencias y están sujetos a controles de aseguramiento de calidad y supervisión proporcional al riesgo por parte de auditores humanos.
          </div>
        </div>
      )
    },
    {
      id: 'sec-11',
      num: '11',
      titulo: 'Cambios al aviso de privacidad',
      icono: FileText,
      resumen: 'Actualizaciones periódicas y notificación a través del portal oficial.',
      contenido: (
        <div>
          <p>
            El presente aviso puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales, de las necesidades operativas de MAYIA y ACAM, o de mejoras en las prácticas de protección de datos.
          </p>
          <p style={{ marginTop: '10px' }}>
            Cualquier modificación será puesta a disposición del público a través de la dirección web oficial:{' '}
            <span style={badgePendienteStyle}>www.mayia.mx/privacidad</span> y, cuando resulte legalmente requerido, mediante aviso directo a los usuarios registrados.
          </p>
          <div style={calloutNotaStyle}>
            <strong>Fecha de emisión y vigencia:</strong> Documento de trabajo formal para revisión del Comité de ACAM · Versión 1.0 (9 de noviembre de 2026).
          </div>
        </div>
      )
    },
    {
      id: 'sec-12',
      num: '12',
      titulo: 'Anexo operativo de cumplimiento',
      icono: FileCheck2,
      resumen: 'Lista de verificación previa a la publicación definitiva del aviso integral.',
      contenido: (
        <div>
          <p>
            Para garantizar la plena validez jurídica e integridad operativa del aviso previo a su publicación final, se completará la siguiente lista de verificación técnica:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', marginTop: '12px' }}>
            {[
              'Confirmar domicilio fiscal definitivo y canal de privacidad',
              'Completar mapa de flujo de datos y fuentes autorizadas',
              'Definir delimitación formal responsable vs. encargado (DPA)',
              'Revisar inventario de subencargados y transferencias',
              'Establecer calendario formal de retención y bloqueo',
              'Acreditar procedimiento y formulario de derechos ARCO',
              'Generar versión simplificada para formularios de registro',
              'Revisión final y dictamen por el área jurídica especializada'
            ].map((item, idx) => (
              <div key={idx} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#CBD5E1'
              }}>
                <span style={{ color: '#DBF285', fontWeight: 700 }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ], []);

  // Filtrado de secciones para búsqueda rápida
  const seccionesFiltradas = useMemo(() => {
    if (!busqueda.trim()) return seccionesPrivacidad;
    const term = busqueda.toLowerCase();
    return seccionesPrivacidad.filter(s => 
      s.titulo.toLowerCase().includes(term) || 
      s.num.includes(term) ||
      (s.resumen && s.resumen.toLowerCase().includes(term))
    );
  }, [busqueda, seccionesPrivacidad]);

  if (!isOpen) return null;

  const handleDescargarDocumentoCompleto = () => {
    const texto = `================================================================================
AVISO DE PRIVACIDAD INTEGRAL Y POLÍTICA DE PROTECCIÓN DE DATOS PERSONALES
MAYIA Inteligencia Artificial, S.A.P.I. de C.V. | Presentación al Comité de ACAM
================================================================================
Documento de trabajo para revisión del Comité de ACAM.
Versión 1.0 | 9 de noviembre de 2026.
Su publicación y aplicación requieren completar los campos pendientes, verificar procesos reales y obtener revisión jurídica.

1. Identidad y domicilio del responsable
MAYIA Inteligencia Artificial, S.A.P.I. de C.V. (en adelante, “MAYIA”), con domicilio para efectos de este aviso en [DOMICILIO COMPLETO PENDIENTE], es responsable del tratamiento de datos personales que recabe directamente como responsable. Contacto de privacidad: [CORREO Y MEDIO DE CONTACTO PENDIENTES]. Cuando MAYIA trate datos por instrucciones de ACAM u otro cliente, las funciones y obligaciones de cada parte se establecerán en el contrato y, cuando proceda, en un acuerdo de tratamiento de datos.

2. Categorías y origen de datos
Podrán tratarse datos de identificación y contacto de representantes, clientes y usuarios autorizados; credenciales y registros de acceso; datos de facturación; solicitudes de soporte; identificadores técnicos y registros de uso. Los resultados de monitoreo pueden incluir nombres, voces, cargos, declaraciones y referencias a personas identificadas o identificables procedentes de radio, televisión, prensa y otras fuentes autorizadas. No se presupone que la difusión pública elimine la protección de los datos personales.

3. Finalidades necesarias
Administrar cuentas y contratos; autenticar accesos; prestar el monitoreo contratado; localizar y clasificar menciones; entregar resultados autorizados; atender incidencias; preservar seguridad, trazabilidad y evidencias operativas; facturar; cumplir obligaciones legales; gestionar solicitudes de derechos y responder requerimientos válidos de autoridades.

4. Finalidades secundarias
Con consentimiento cuando legalmente corresponda: comunicaciones comerciales, encuestas y propuestas de servicios. La negativa a estas finalidades no condicionará el servicio principal. Mecanismo para oponerse: [CORREO PENDIENTE].

5. Bases de legitimación y datos sensibles
MAYIA identificará la base jurídica aplicable a cada operación y recabará consentimiento cuando sea exigible. No tratará intencionalmente datos sensibles salvo necesidad acreditada y fundamento legal suficiente, incluyendo consentimiento expreso cuando proceda. La monitorización de noticias no autoriza por sí sola perfiles sensibles, inferencias de afiliación política ni decisiones automatizadas con efectos jurídicos.

6. Transferencias y encargados
Podrán intervenir proveedores de infraestructura, alojamiento, seguridad, soporte y analítica bajo instrucciones y obligaciones de confidencialidad y seguridad. Las transferencias a terceros distintos de encargados se realizarán únicamente con base legal y, en su caso, consentimiento, identificando destinatarios y finalidades antes de ejecutarlas. Destinatarios concretos y países: [INVENTARIO PENDIENTE].

7. Conservación y eliminación
Los datos se conservarán sólo por el plazo necesario para cada finalidad, obligaciones legales y defensa de derechos. Los testigos audiovisuales no se conservarán automáticamente tres meses: ese plazo sólo será aplicable a materiales cuya captura y conservación estén autorizadas y a lo pactado con el cliente. Se establecerá un calendario documentado de retención, bloqueo y eliminación: [PENDIENTE].

8. Seguridad y gestión de incidentes
Se aplicarán controles proporcionales: acceso por roles, autenticación, cifrado cuando corresponda, bitácoras, respaldos, segregación de ambientes, revisión de proveedores y procedimiento de incidentes. No se declara certificación ISO ni auditoría externa no acreditada. Las notificaciones de incidentes se harán conforme a los requisitos legales y contractuales aplicables.

9. Derechos ARCO, revocación y limitación
La persona titular podrá solicitar acceso, rectificación, cancelación u oposición y, cuando proceda, revocar consentimiento o limitar uso y divulgación, mediante [CORREO, DOMICILIO Y FORMULARIO PENDIENTES]. La solicitud deberá permitir identificar al titular o representante y describir el derecho ejercido. MAYIA atenderá los plazos y excepciones previstos en la legislación aplicable e informará su respuesta por el medio indicado.

10. Cookies, plataformas y decisiones automatizadas
En caso de utilizar cookies, analítica web o tecnologías equivalentes, se informarán categorías, finalidades y mecanismos de gestión en una política específica. Los resultados de IA son asistivos, pueden contener errores y estarán sujetos a controles de calidad y revisión proporcional al riesgo.

11. Cambios al aviso
Las modificaciones se comunicarán mediante [URL DEL AVISO PENDIENTE] y, cuando sea necesario, por aviso directo a los titulares. Fecha de entrada en vigor: [PENDIENTE].

12. Anexo operativo de cumplimiento
Antes de publicación: confirmar domicilio y contacto; mapa de datos y fuentes; roles responsable/encargado; bases jurídicas; consentimiento; inventario de transferencias y subencargados; plazos de retención; procedimiento ARCO; cookies; medidas de seguridad; protocolo de incidentes y versiones simplificadas para formularios.

--------------------------------------------------------------------------------
REFERENCIAS NORMATIVAS Y REVISIÓN
Marco mexicano de referencia:
- Ley Federal de Protección de Datos Personales en Posesión de los Particulares (DOF 14-11-2025)
  Fuente oficial: https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf
- Ley Federal del Derecho de Autor (DOF 15-01-2026)
  Fuente oficial: https://www.diputados.gob.mx/LeyesBiblio/pdf/LFDA.pdf
- Disposiciones contractuales, de consumo y demás normas aplicables según el caso.
Este borrador no sustituye dictamen jurídico ni acredita licencias.

MAYIA | DOCUMENTO PARA REVISIÓN · ACAM | www.mayia.mx
`;
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Aviso-de-Privacidad-Integral-MAYIA-ACAM.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const modalNode = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(3, 6, 10, 0.86)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        // Cerrar al hacer clic en el backdrop exterior
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{
          background: '#0d1117',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '22px',
          width: '100%',
          maxWidth: '860px',
          height: '88vh',
          maxHeight: '840px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 90px -20px rgba(0, 0, 0, 0.95), 0 0 50px rgba(219, 242, 133, 0.06)',
          color: '#FFFFFF',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado Corporativo y Elegante (flexShrink: 0) */}
        <div style={{
          flexShrink: 0,
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)',
          gap: '14px',
          flexWrap: 'nowrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(219, 242, 133, 0.12)',
              border: '1px solid rgba(219, 242, 133, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DBF285',
              flexShrink: 0,
            }}>
              <Scale size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                  Aviso de Privacidad & Marco Legal
                </span>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: '#DBF285',
                  background: 'rgba(219, 242, 133, 0.12)',
                  border: '1px solid rgba(219, 242, 133, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  whiteSpace: 'nowrap',
                }}>
                  Versión 1.0 · 2026
                </span>
              </div>
              <div style={{
                fontSize: '11.5px',
                color: '#9CA3AF',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                MAYIA Inteligencia Artificial, S.A.P.I. de C.V. · Presentación al Comité de ACAM
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleDescargarDocumentoCompleto}
              title="Descargar versión íntegra (.txt)"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#CBD5E1',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Download size={13} />
              <span>Descargar</span>
            </button>
            <button
              onClick={onClose}
              title="Cerrar modal"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9CA3AF',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación Legal (flexShrink: 0) */}
        <div style={{
          flexShrink: 0,
          minHeight: '46px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: '#090d13',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {[
            { id: 'privacidad', label: 'Aviso de Privacidad Integral', icon: Shield },
            { id: 'terminos', label: 'Términos de Servicio', icon: FileText },
            { id: 'nda', label: 'Confidencialidad (NDA)', icon: Lock },
            { id: 'custodia', label: 'Cadena de Custodia', icon: CheckCircle2 },
          ].map(tab => {
            const Icon = tab.icon;
            const activo = tabActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id as any)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: activo ? '1px solid #DBF285' : '1px solid transparent',
                  background: activo ? 'rgba(219, 242, 133, 0.15)' : 'transparent',
                  color: activo ? '#DBF285' : '#94A3B8',
                  fontSize: '12px',
                  fontWeight: activo ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <Icon size={13.5} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenedor del Documento con Scroll Propio (flex: 1 1 auto, minHeight: 0) */}
        <div style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          padding: '22px 24px',
          fontSize: '13px',
          lineHeight: '1.65',
          color: '#E2E8F0',
        }}>
          {tabActiva === 'privacidad' && (
            <div>
              {/* Nota Preliminar de Trabajo */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}>
                <FileText size={18} color="#DBF285" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '11.8px', color: '#94A3B8', lineHeight: 1.55 }}>
                  <strong style={{ color: '#F1F5F9' }}>Documento de trabajo para revisión del Comité de ACAM · Versión 1.0 (9 de noviembre de 2026).</strong><br />
                  Su publicación y aplicación operativa requieren completar los campos de enlace pendientes, verificar los procesos reales y obtener el dictamen de revisión jurídica final.
                </div>
              </div>

              {/* Buscador de secciones dentro del Aviso */}
              <div style={{ position: 'relative', marginBottom: '18px' }}>
                <Search size={14} color="#64748B" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar en el aviso (ej. ARCO, transferencias, cookies, retención)..."
                  style={{
                    width: '100%',
                    padding: '8px 14px 8px 34px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Lista Estructurada de Secciones */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {seccionesFiltradas.map((sec) => (
                  <article
                    key={sec.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      padding: '16px 18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#DBF285',
                        background: 'rgba(219, 242, 133, 0.1)',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        flexShrink: 0,
                      }}>
                        {sec.num}
                      </span>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#F8FAFC',
                        margin: 0,
                        letterSpacing: '-0.01em',
                      }}>
                        {sec.titulo}
                      </h4>
                    </div>
                    <div style={{ fontSize: '12.6px', color: '#CBD5E1', lineHeight: '1.65' }}>
                      {sec.contenido}
                    </div>
                  </article>
                ))}
              </div>

              {/* Referencias Normativas Oficiales */}
              <div style={{
                marginTop: '22px',
                padding: '16px 18px',
                background: 'rgba(219, 242, 133, 0.03)',
                border: '1px solid rgba(219, 242, 133, 0.15)',
                borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DBF285', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                  <Scale size={16} />
                  <span>Referencias Normativas y Marco Jurídico Mexicano</span>
                </div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 10px', lineHeight: 1.6 }}>
                  Marco de referencia aplicable en los Estados Unidos Mexicanos:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <a
                    href="https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#DBF285',
                      fontSize: '12px',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={12} />
                    <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares</strong> (Texto vigente, reforma DOF 14-11-2025)
                  </a>
                  <a
                    href="https://www.diputados.gob.mx/LeyesBiblio/pdf/LFDA.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#DBF285',
                      fontSize: '12px',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={12} />
                    <strong>Ley Federal del Derecho de Autor</strong> (Texto vigente, reforma DOF 15-01-2026)
                  </a>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '12px', fontStyle: 'italic' }}>
                  Este borrador normativo no sustituye un dictamen jurídico individualizado ni acredita licencias ajenas a la auditoría de medios.
                </div>
              </div>
            </div>
          )}

          {tabActiva === 'terminos' && (
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#DBF285', marginTop: 0, marginBottom: '10px' }}>
                1. Términos de Servicio y Acceso al Sistema de Auditoría ACAM
              </h4>
              <p>
                El acceso y utilización de esta plataforma está restringido exclusivamente al personal acreditado, auditores autorizados y directivos de cuentas contratantes. El sistema procesa y emite reportes en tiempo real sobre emisiones de radio comercial, televisión y prensa impresa en el territorio mexicano.
              </p>
              <div style={calloutNotaStyle}>
                <strong style={{ color: '#DBF285' }}>Meta Contractual de Precisión:</strong> La plataforma opera bajo un estándar contractual de precisión mínima del <strong>97.5%</strong> en la detección de spots y pauta comercial frente a la auditoría humana.
              </div>
              <p>
                El usuario se compromete a no intentar descompilar, realizar ingeniería inversa ni extraer de manera masiva los modelos de inferencia fonética o de visión artificial integrados en los servidores de la plataforma.
              </p>
            </div>
          )}

          {tabActiva === 'nda' && (
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#DBF285', marginTop: 0, marginBottom: '10px' }}>
                2. Acuerdo de Confidencialidad y Secreto Industrial (NDA)
              </h4>
              <p>
                Toda la información contenida en el tablero —incluyendo tarifas brutas y netas, horarios exactos de transmisión, inversiones estimadas de competidores, Share of Voice (SOV), archivos de audio MP3 y grabaciones audiovisuales— constituye <strong>Secreto Industrial</strong> en términos del artículo 82 de la Ley Federal de Protección a la Propiedad Industrial.
              </p>
              <ul style={listaStyle}>
                <li><strong>Prohibición de transferencia:</strong> Ningún dato de monitoreo puede ser cedido, publicado o transferido a agencias o medios competidores sin consentimiento por escrito.</li>
                <li><strong>Credenciales personales:</strong> El identificador y clave de acceso son personales e intransferibles.</li>
                <li><strong>Sanciones:</strong> El incumplimiento dará lugar al bloqueo inmediato y acciones legales correspondientes.</li>
              </ul>
            </div>
          )}

          {tabActiva === 'custodia' && (
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#DBF285', marginTop: 0, marginBottom: '10px' }}>
                3. Cadena de Custodia y Validez Legal de los Testigos
              </h4>
              <p>
                Para garantizar que las detecciones de pauta publicitaria tengan plena fuerza probatoria ante reclamos de bonificación o incumplimiento, la plataforma implementa una cadena de custodia digital estructurada:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', margin: '16px 0' }}>
                <div style={cardCustodiaStyle}>
                  <div style={{ fontWeight: 700, color: '#DBF285', fontSize: '12px' }}>Timestamp Criptográfico</div>
                  <div style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: '4px' }}>Sello de tiempo NTP de alta precisión sincronizado con el Centro Nacional de Metrología (CENAM).</div>
                </div>
                <div style={cardCustodiaStyle}>
                  <div style={{ fontWeight: 700, color: '#DBF285', fontSize: '12px' }}>Hash SHA-256 Inmutable</div>
                  <div style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: '4px' }}>Cada fragmento de audio y captura visual genera un hash único que previene alteraciones posteriores.</div>
                </div>
                <div style={cardCustodiaStyle}>
                  <div style={{ fontWeight: 700, color: '#DBF285', fontSize: '12px' }}>Metadatos de Emisión</div>
                  <div style={{ fontSize: '11.5px', color: '#9CA3AF', marginTop: '4px' }}>Frecuencia, potencia de señal, plaza (CDMX, GDL, MTY) e ID de sesión grabados en el testigo.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie con Acciones y Firma Institucional (flexShrink: 0) */}
        <div style={{
          flexShrink: 0,
          padding: '14px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#090d13',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ fontSize: '11.5px', color: '#64748B' }}>
            MAYIA | DOCUMENTO PARA REVISIÓN · ACAM | <span style={{ color: '#94A3B8' }}>www.mayia.mx</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9CA3AF',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '7px 14px',
              }}
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onAccept?.();
                onClose();
              }}
              style={{
                background: '#DBF285',
                color: '#0d130a',
                border: 'none',
                borderRadius: '999px',
                padding: '8px 22px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(219, 242, 133, 0.25)',
              }}
            >
              Entendido y Conforme
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
};

// Estilos auxiliares limpios y sobrios
const badgePendienteStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  padding: '1px 7px',
  fontSize: '11.5px',
  color: '#CBD5E1',
  fontFamily: 'monospace',
};

const calloutNotaStyle: React.CSSProperties = {
  background: 'rgba(219, 242, 133, 0.04)',
  borderLeft: '3px solid #DBF285',
  padding: '10px 14px',
  borderRadius: '0 10px 10px 0',
  marginTop: '10px',
  fontSize: '12px',
  color: '#CBD5E1',
  lineHeight: 1.55,
};

const calloutAlertaStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.025)',
  borderLeft: '3px solid rgba(255, 255, 255, 0.3)',
  padding: '10px 14px',
  borderRadius: '0 10px 10px 0',
  marginTop: '10px',
  fontSize: '12px',
  color: '#E2E8F0',
  lineHeight: 1.55,
};

const listaStyle: React.CSSProperties = {
  paddingLeft: '18px',
  margin: '8px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const cardCustodiaStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.025)',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.06)',
};
